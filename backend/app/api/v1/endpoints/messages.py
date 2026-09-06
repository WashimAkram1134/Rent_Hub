from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, desc
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.message import Message
from app.models.booking import Booking
from app.models.product import Product
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse
from app.auth.dependencies import CurrentUser, get_current_user_optional
from app.websocket.manager import ws_manager

router = APIRouter(tags=["messages"])

# In-memory store for admin internal notes and conversation metadata overrides
# (Persisted for conversation sessions)
CONVERSATION_METADATA: Dict[str, Dict[str, Any]] = {}

class AdminReplyRequest(BaseModel):
    booking_id: UUID
    content: str = Field(..., min_length=1)
    message_type: str = Field("reply", description="'reply', 'warning', or 'internal_note'")
    warning_reason: Optional[str] = None

class AdminActionRequest(BaseModel):
    booking_id: UUID
    action: str = Field(..., description="'resolve', 'close', 'reopen', 'escalate_dispute', 'flag_reported', 'unflag'")
    reason: Optional[str] = None

def get_time_ago(dt: datetime) -> str:
    if not dt:
        return "recently"
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return f"{max(1, seconds)}s ago"
    elif seconds < 3600:
        return f"{seconds // 60}m ago"
    elif seconds < 86400:
        return f"{seconds // 3600}h ago"
    else:
        return f"{seconds // 86400}d ago"

def infer_topic_and_flags(booking: Booking, messages: List[Message]) -> Dict[str, Any]:
    b_id = str(booking.id)
    override = CONVERSATION_METADATA.get(b_id, {})

    # Default based on booking status or message content
    all_text = " ".join([m.content.lower() for m in messages]) if messages else ""
    
    topic = override.get("topic")
    if not topic:
        if "bkash" in all_text or "payment" in all_text or "fee" in all_text or "refund" in all_text or "cost" in all_text:
            topic = "Payment problem"
        elif "damage" in all_text or "broken" in all_text or "late" in all_text or "dispute" in all_text or booking.status == "disputed":
            topic = "Dispute & Damage"
        elif "cancel" in all_text or booking.status == "cancelled":
            topic = "Refund / Cancellation"
        elif "nid" in all_text or "verify" in all_text or "license" in all_text:
            topic = "Account Verification"
        elif "condition" in all_text or "spec" in all_text or "car" in all_text or "key" in all_text:
            topic = "Listing inquiry"
        elif booking.status == "pending":
            topic = "Booking issue"
        else:
            topic = "General support"

    is_reported = override.get("is_reported", False)
    if not is_reported:
        # Auto-flag suspicious keywords (e.g. off-platform contacts)
        if any(w in all_text for w in ["offline payment", "send money directly", "whatsapp me", "direct deal", "avoid fee"]):
            is_reported = True

    is_dispute = override.get("is_dispute", False) or booking.status == "disputed" or "dispute" in all_text
    conv_status = override.get("status", "open")
    priority = override.get("priority")
    if not priority:
        if is_dispute or "fraud" in all_text:
            priority = "critical"
        elif is_reported or "cancel" in all_text or "refund" in all_text:
            priority = "high"
        else:
            priority = "normal"

    internal_notes = override.get("internal_notes", [])

    return {
        "topic": topic,
        "is_reported": is_reported,
        "is_dispute": is_dispute,
        "status": conv_status,
        "priority": priority,
        "internal_notes": internal_notes
    }

@router.get("/unread-count")
async def get_unread_count(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(func.count(Message.id)).where(
        Message.receiver_id == current_user.id,
        Message.is_read == False
    )
    result = await db.execute(stmt)
    count = result.scalar() or 0
    return {"count": count}

# ── 1. ADMIN PLATFORM CONVERSATIONS LIST ────────────────────────────────────────
@router.get("/admin/conversations")
async def get_admin_conversations(
    tab: str = Query("all", description="'all', 'support', 'reported', 'disputes', 'unread'"),
    topic: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    # Fetch all bookings with products, renters, owners
    stmt = (
        select(Booking)
        .options(
            selectinload(Booking.product).selectinload(Product.images),
            selectinload(Booking.product).selectinload(Product.category),
            selectinload(Booking.renter),
            selectinload(Booking.owner)
        )
        .order_by(Booking.created_at.desc())
    )
    result = await db.execute(stmt)
    bookings = result.scalars().all()

    conversations = []

    tab_str = tab if isinstance(tab, str) else "all"
    topic_str = topic if isinstance(topic, str) else None
    status_str = status_filter if isinstance(status_filter, str) else None
    search_str = search if isinstance(search, str) else None

    for b in bookings:
        # Fetch messages for this booking
        m_stmt = (
            select(Message)
            .where(Message.booking_id == b.id)
            .order_by(Message.created_at.asc())
        )
        m_res = await db.execute(m_stmt)
        messages = m_res.scalars().all()

        meta = infer_topic_and_flags(b, messages)

        # Apply Tab Filter
        if tab_str == "support" and meta["topic"] not in ["General support", "Account Verification", "Booking issue"]:
            continue
        if tab_str == "reported" and not meta["is_reported"]:
            continue
        if tab_str == "disputes" and not meta["is_dispute"]:
            continue
        if tab_str == "unread" and not any(not m.is_read for m in messages):
            continue

        # Apply Topic Filter
        if topic_str and topic_str.lower() != "all" and topic_str.lower() not in meta["topic"].lower():
            continue

        # Apply Status Filter
        if status_str and status_str.lower() != "all" and meta["status"] != status_str.lower():
            continue

        # Search Query
        renter_name = f"{b.renter.first_name} {b.renter.last_name}" if b.renter else "Customer"
        owner_name = f"{b.owner.first_name} {b.owner.last_name}" if b.owner else "Owner"
        product_title = b.product.title if b.product else "Item"
        booking_code = f"#BKG-{str(b.id)[:4].upper()}"

        if search_str and search_str.strip():
            term = search_str.strip().lower()
            match = (
                term in renter_name.lower() or
                term in owner_name.lower() or
                term in product_title.lower() or
                term in booking_code.lower() or
                term in meta["topic"].lower() or
                any(term in m.content.lower() for m in messages)
            )
            if not match:
                continue

        last_m = messages[-1] if messages else None
        last_sender_name = (
            "Admin" if last_m and last_m.sender_id not in [b.renter_id, b.owner_id] else
            (renter_name if last_m and last_m.sender_id == b.renter_id else owner_name)
        )

        unread_count = sum(1 for m in messages if not m.is_read)

        prod_img = ""
        if b.product and b.product.images:
            prod_img = b.product.images[0].url

        conversations.append({
            "booking_id": str(b.id),
            "booking_code": booking_code,
            "topic": meta["topic"],
            "status": meta["status"],
            "priority": meta["priority"],
            "is_reported": meta["is_reported"],
            "is_dispute": meta["is_dispute"],
            "unread_count": unread_count,
            "last_message": {
                "content": last_m.content if last_m else "Booking created. Awaiting chat.",
                "sender_name": last_sender_name,
                "created_at": last_m.created_at.strftime("%b %d, %I:%M %p") if last_m and last_m.created_at else "Recently",
                "time_ago": get_time_ago(last_m.created_at) if last_m else "New"
            },
            "customer": {
                "id": str(b.renter.id) if b.renter else "",
                "name": renter_name,
                "email": b.renter.email if b.renter else "",
                "phone": b.renter.phone if b.renter else "+880 1712-000000",
                "avatar_url": b.renter.avatar_url if b.renter else None,
                "is_verified": b.renter.identity_verification_status == "VERIFIED" if b.renter else True,
                "role": "Customer",
                "is_online": True
            },
            "owner": {
                "id": str(b.owner.id) if b.owner else "",
                "name": owner_name,
                "email": b.owner.email if b.owner else "",
                "phone": b.owner.phone if b.owner else "+880 1812-000000",
                "avatar_url": b.owner.avatar_url if b.owner else None,
                "is_verified": b.owner.identity_verification_status == "VERIFIED" if b.owner else True,
                "role": "Host Owner",
                "is_online": True
            },
            "booking": {
                "id": str(b.id),
                "code": booking_code,
                "status": b.status,
                "start_date": str(b.start_date),
                "end_date": str(b.end_date),
                "total_amount": float(b.total_amount),
                "delivery_option": b.delivery_option,
                "created_at": b.created_at.strftime("%b %d, %Y") if b.created_at else ""
            },
            "product": {
                "id": str(b.product.id) if b.product else "",
                "title": product_title,
                "slug": b.product.slug if b.product else "",
                "image_url": prod_img,
                "price_per_day": float(b.product.price_per_day) if b.product else 0,
                "category": b.product.category.name if b.product and b.product.category else "Vehicle",
                "is_active": b.product.is_active if b.product else True
            },
            "internal_notes": meta["internal_notes"],
            "messages_count": len(messages)
        })

    return {
        "conversations": conversations,
        "total": len(conversations),
        "counts": {
            "all": len(bookings),
            "support": sum(1 for c in conversations if c["topic"] in ["General support", "Account Verification", "Booking issue"]),
            "reported": sum(1 for c in conversations if c["is_reported"]),
            "disputes": sum(1 for c in conversations if c["is_dispute"]),
            "unread": sum(1 for c in conversations if c["unread_count"] > 0)
        }
    }

# ── 2. ADMIN GET SINGLE CONVERSATION WITH FULL MESSAGES ────────────────────────
@router.get("/admin/conversations/{booking_id}")
async def get_admin_conversation_thread(
    booking_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    b = await db.get(Booking, booking_id)
    if not b:
        raise HTTPException(status_code=404, detail="Booking conversation not found")

    # Load relationships
    stmt = (
        select(Booking)
        .where(Booking.id == booking_id)
        .options(
            selectinload(Booking.product).selectinload(Product.images),
            selectinload(Booking.product).selectinload(Product.category),
            selectinload(Booking.renter),
            selectinload(Booking.owner)
        )
    )
    b_res = await db.execute(stmt)
    booking = b_res.scalar_one()

    # Load messages
    m_stmt = (
        select(Message)
        .where(Message.booking_id == booking_id)
        .order_by(Message.created_at.asc())
    )
    m_res = await db.execute(m_stmt)
    messages = m_res.scalars().all()

    meta = infer_topic_and_flags(booking, messages)

    renter_name = f"{booking.renter.first_name} {booking.renter.last_name}" if booking.renter else "Customer"
    owner_name = f"{booking.owner.first_name} {booking.owner.last_name}" if booking.owner else "Owner"

    thread_messages = []
    for m in messages:
        sender_role = "admin"
        sender_name = "RentHub Support"
        is_warning = False

        if m.sender_id == booking.renter_id:
            sender_role = "customer"
            sender_name = renter_name
        elif m.sender_id == booking.owner_id:
            sender_role = "owner"
            sender_name = owner_name
        elif "OFFICIAL RENTHUB" in m.content or "WARNING" in m.content:
            sender_role = "system"
            sender_name = "🛡️ RentHub Safety Bot"
            is_warning = True

        thread_messages.append({
            "id": str(m.id),
            "sender_id": str(m.sender_id),
            "sender_name": sender_name,
            "sender_role": sender_role,
            "content": m.content,
            "is_read": m.is_read,
            "is_warning": is_warning,
            "created_at": m.created_at.strftime("%I:%M %p") if m.created_at else "Just now",
            "date": m.created_at.strftime("%b %d, %Y") if m.created_at else "Today"
        })

    prod_img = ""
    if booking.product and booking.product.images:
        prod_img = booking.product.images[0].url

    return {
        "booking_id": str(booking.id),
        "booking_code": f"#BKG-{str(booking.id)[:4].upper()}",
        "topic": meta["topic"],
        "status": meta["status"],
        "priority": meta["priority"],
        "is_reported": meta["is_reported"],
        "is_dispute": meta["is_dispute"],
        "customer": {
            "id": str(booking.renter.id) if booking.renter else "",
            "name": renter_name,
            "email": booking.renter.email if booking.renter else "",
            "phone": booking.renter.phone if booking.renter else "+880 1712-000000",
            "avatar_url": booking.renter.avatar_url if booking.renter else None,
            "is_verified": booking.renter.identity_verification_status == "VERIFIED" if booking.renter else True,
            "role": "Customer",
            "member_since": booking.renter.created_at.strftime("%b %Y") if booking.renter and booking.renter.created_at else "2025"
        },
        "owner": {
            "id": str(booking.owner.id) if booking.owner else "",
            "name": owner_name,
            "email": booking.owner.email if booking.owner else "",
            "phone": booking.owner.phone if booking.owner else "+880 1812-000000",
            "avatar_url": booking.owner.avatar_url if booking.owner else None,
            "is_verified": booking.owner.identity_verification_status == "VERIFIED" if booking.owner else True,
            "role": "Host Owner",
            "member_since": booking.owner.created_at.strftime("%b %Y") if booking.owner and booking.owner.created_at else "2025"
        },
        "booking": {
            "id": str(booking.id),
            "code": f"#BKG-{str(booking.id)[:4].upper()}",
            "status": booking.status,
            "start_date": str(booking.start_date),
            "end_date": str(booking.end_date),
            "total_days": int(booking.total_days),
            "daily_rate": float(booking.daily_rate),
            "subtotal": float(booking.subtotal),
            "security_deposit": float(booking.security_deposit),
            "total_amount": float(booking.total_amount),
            "delivery_option": booking.delivery_option,
            "created_at": booking.created_at.strftime("%b %d, %Y") if booking.created_at else ""
        },
        "product": {
            "id": str(booking.product.id) if booking.product else "",
            "title": booking.product.title if booking.product else "Item",
            "slug": booking.product.slug if booking.product else "",
            "image_url": prod_img,
            "price_per_day": float(booking.product.price_per_day) if booking.product else 0,
            "category": booking.product.category.name if booking.product and booking.product.category else "Vehicle",
            "is_active": booking.product.is_active if booking.product else True
        },
        "internal_notes": meta["internal_notes"],
        "messages": thread_messages
    }

# ── 3. ADMIN REPLY / WARN / INTERNAL NOTE ───────────────────────────────────────
@router.post("/admin/reply")
async def send_admin_reply(
    payload: AdminReplyRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    b = await db.get(Booking, payload.booking_id)
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    b_id_str = str(payload.booking_id)

    # 1. Internal Note (Private to Staff)
    if payload.message_type == "internal_note":
        if b_id_str not in CONVERSATION_METADATA:
            CONVERSATION_METADATA[b_id_str] = {}
        notes = CONVERSATION_METADATA[b_id_str].setdefault("internal_notes", [])
        notes.append({
            "author": f"{current_user.first_name} {current_user.last_name}" if current_user else "Admin Staff",
            "content": payload.content,
            "created_at": datetime.now(timezone.utc).strftime("%b %d, %I:%M %p")
        })
        return {"message": "Internal note attached successfully", "notes": notes}

    # 2. System Warning or Official Admin Reply
    admin_id = current_user.id if current_user else b.owner_id
    admin_name = f"{current_user.first_name} (Admin)" if current_user else "RentHub Support Admin"

    content = payload.content
    if payload.message_type == "warning":
        content = f"⚠️ [OFFICIAL RENTHUB WARNING] {payload.warning_reason or 'Policy Violation'}: {payload.content}"

    # Insert message to both customer and owner
    msg = Message(
        booking_id=payload.booking_id,
        sender_id=admin_id,
        receiver_id=b.renter_id,
        content=content,
        is_read=False
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    # Broadcast via WS
    broadcast_data = {
        "type": "NEW_MESSAGE",
        "message": {
            "id": str(msg.id),
            "booking_id": str(msg.booking_id),
            "sender_id": str(msg.sender_id),
            "sender_name": admin_name,
            "sender_role": "admin" if payload.message_type != "warning" else "system",
            "content": msg.content,
            "is_read": False,
            "is_warning": payload.message_type == "warning",
            "created_at": datetime.now(timezone.utc).strftime("%I:%M %p")
        }
    }
    await ws_manager.broadcast_to_user(b.renter_id, broadcast_data)
    await ws_manager.broadcast_to_user(b.owner_id, broadcast_data)

    return {"message": "Message sent into conversation", "message_id": str(msg.id)}

# ── 4. ADMIN INTERVENTION ACTIONS (Resolve, Close, Reopen, Escalate) ───────────
@router.post("/admin/action")
async def execute_admin_action(
    payload: AdminActionRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    b = await db.get(Booking, payload.booking_id)
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    b_id_str = str(payload.booking_id)
    if b_id_str not in CONVERSATION_METADATA:
        CONVERSATION_METADATA[b_id_str] = {}

    action = payload.action.lower()
    system_text = ""

    if action == "resolve":
        CONVERSATION_METADATA[b_id_str]["status"] = "resolved"
        system_text = "✅ This conversation has been marked as RESOLVED by RentHub Support."
    elif action == "close":
        CONVERSATION_METADATA[b_id_str]["status"] = "closed"
        system_text = "🔒 This conversation thread has been CLOSED by RentHub Administration."
    elif action == "reopen":
        CONVERSATION_METADATA[b_id_str]["status"] = "open"
        system_text = "🔓 This conversation thread has been REOPENED by RentHub Support."
    elif action == "escalate_dispute":
        CONVERSATION_METADATA[b_id_str]["is_dispute"] = True
        CONVERSATION_METADATA[b_id_str]["priority"] = "critical"
        b.status = "disputed"
        await db.commit()
        system_text = f"⚖️ ESCALATION: This conversation has been escalated to a formal platform DISPUTE case. Reason: {payload.reason or 'User intervention requested'}."
    elif action == "flag_reported":
        CONVERSATION_METADATA[b_id_str]["is_reported"] = True
        CONVERSATION_METADATA[b_id_str]["priority"] = "high"
        system_text = "🚩 This conversation has been flagged for SAFETY & MODERATION review."
    elif action == "unflag":
        CONVERSATION_METADATA[b_id_str]["is_reported"] = False
        CONVERSATION_METADATA[b_id_str]["priority"] = "normal"
        system_text = "🛡️ Moderation flag cleared by administrator."

    # Post system message into chat
    admin_id = current_user.id if current_user else b.owner_id
    sys_msg = Message(
        booking_id=payload.booking_id,
        sender_id=admin_id,
        receiver_id=b.renter_id,
        content=system_text,
        is_read=False
    )
    db.add(sys_msg)
    await db.commit()

    return {
        "message": f"Action '{payload.action}' executed successfully.",
        "status": CONVERSATION_METADATA[b_id_str].get("status", "open"),
        "is_reported": CONVERSATION_METADATA[b_id_str].get("is_reported", False),
        "is_dispute": CONVERSATION_METADATA[b_id_str].get("is_dispute", False)
    }

# ── 5. STANDARD USER ENDPOINTS ──────────────────────────────────────────────────
@router.get("/{booking_id}", response_model=list[MessageResponse])
async def get_messages(
    booking_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Message).where(Message.booking_id == booking_id).order_by(Message.created_at.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    payload: MessageCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    sender_id = current_user.id
    
    new_message = Message(
        booking_id=payload.booking_id,
        sender_id=sender_id,
        receiver_id=payload.receiver_id,
        content=payload.content,
        is_read=False
    )
    db.add(new_message)
    await db.commit()
    await db.refresh(new_message)
    
    # Broadcast to receiver and sender via WebSocket
    message_data = {
        "type": "NEW_MESSAGE",
        "message": {
            "id": str(new_message.id),
            "booking_id": str(new_message.booking_id),
            "sender_id": str(new_message.sender_id),
            "receiver_id": str(new_message.receiver_id),
            "content": new_message.content,
            "is_read": new_message.is_read,
            "created_at": new_message.created_at.isoformat()
        }
    }
    await ws_manager.broadcast_to_user(new_message.receiver_id, message_data)
    await ws_manager.broadcast_to_user(new_message.sender_id, message_data)
    
    return new_message
