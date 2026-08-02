"""
RentHub Backend — Application Constants & Enumerations

All magic values, string literals, and domain enumerations live here.
Import from this module rather than scattering literals across the codebase.
"""

from __future__ import annotations

from enum import Enum


# ─── User & RBAC ───────────────────────────────────────────────────────────

class UserRole(str, Enum):
    GUEST = "guest"
    CUSTOMER = "customer"
    OWNER = "owner"
    ADMIN = "admin"


class Permission(str, Enum):
    # Products
    PRODUCT_CREATE = "product:create"
    PRODUCT_READ = "product:read"
    PRODUCT_UPDATE = "product:update"
    PRODUCT_DELETE = "product:delete"
    PRODUCT_APPROVE = "product:approve"

    # Bookings
    BOOKING_CREATE = "booking:create"
    BOOKING_READ = "booking:read"
    BOOKING_MANAGE = "booking:manage"
    BOOKING_APPROVE = "booking:approve"

    # Payments
    PAYMENT_READ = "payment:read"
    PAYMENT_REFUND = "payment:refund"

    # Users
    USER_READ = "user:read"
    USER_MANAGE = "user:manage"
    USER_BAN = "user:ban"

    # Reviews
    REVIEW_CREATE = "review:create"
    REVIEW_DELETE = "review:delete"

    # Admin
    ADMIN_ACCESS = "admin:access"
    ANALYTICS_READ = "analytics:read"


# Default permissions for each role
ROLE_PERMISSIONS: dict[UserRole, list[Permission]] = {
    UserRole.GUEST: [
        Permission.PRODUCT_READ,
    ],
    UserRole.CUSTOMER: [
        Permission.PRODUCT_READ,
        Permission.BOOKING_CREATE,
        Permission.BOOKING_READ,
        Permission.PAYMENT_READ,
        Permission.REVIEW_CREATE,
    ],
    UserRole.OWNER: [
        Permission.PRODUCT_READ,
        Permission.PRODUCT_CREATE,
        Permission.PRODUCT_UPDATE,
        Permission.PRODUCT_DELETE,
        Permission.BOOKING_READ,
        Permission.BOOKING_APPROVE,
        Permission.BOOKING_MANAGE,
        Permission.PAYMENT_READ,
        Permission.REVIEW_CREATE,
    ],
    UserRole.ADMIN: [p for p in Permission],  # All permissions
}


# ─── Booking ────────────────────────────────────────────────────────────────

class BookingStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    ACTIVE = "active"          # Rental period has started
    COMPLETED = "completed"
    DISPUTED = "disputed"


class DeliveryOption(str, Enum):
    PICKUP = "pickup"          # Renter picks up from owner
    DELIVERY = "delivery"      # Owner delivers to renter
    BOTH = "both"              # Owner offers both


# ─── Payment ─────────────────────────────────────────────────────────────────

class PaymentMethod(str, Enum):
    ONLINE = "online"
    CASH = "cash"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class TransactionType(str, Enum):
    CHARGE = "charge"
    REFUND = "refund"
    SECURITY_DEPOSIT = "security_deposit"
    SECURITY_RELEASE = "security_release"
    PAYOUT = "payout"


# ─── Product ─────────────────────────────────────────────────────────────────

class ProductCondition(str, Enum):
    NEW = "new"
    LIKE_NEW = "like_new"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


# ─── Notification ────────────────────────────────────────────────────────────

class NotificationType(str, Enum):
    BOOKING_REQUEST = "booking_request"
    BOOKING_APPROVED = "booking_approved"
    BOOKING_REJECTED = "booking_rejected"
    BOOKING_CANCELLED = "booking_cancelled"
    BOOKING_COMPLETED = "booking_completed"
    PAYMENT_RECEIVED = "payment_received"
    PAYMENT_FAILED = "payment_failed"
    REVIEW_RECEIVED = "review_received"
    MESSAGE_RECEIVED = "message_received"
    IDENTITY_VERIFIED = "identity_verified"
    ACCOUNT_WARNING = "account_warning"
    SYSTEM = "system"


# ─── Review ──────────────────────────────────────────────────────────────────

class ReviewType(str, Enum):
    PRODUCT = "product"          # Renter reviews the product
    OWNER = "owner"              # Renter reviews the owner
    RENTER = "renter"            # Owner reviews the renter


# ─── Storage ─────────────────────────────────────────────────────────────────

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_MB = 10
MAX_IMAGES_PER_PRODUCT = 10


# ─── Pagination ──────────────────────────────────────────────────────────────

DEFAULT_PAGE = 1
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100


# ─── API ─────────────────────────────────────────────────────────────────────

API_V1_PREFIX = "/api/v1"
API_TITLE = "RentHub API"
API_DESCRIPTION = """
RentHub is a rental marketplace connecting **Owners** and **Renters**.

## Authentication
All protected endpoints require a valid JWT Bearer token.
Obtain tokens via `POST /api/v1/auth/login`.

## Pagination
List endpoints accept `page` and `page_size` query parameters.

## Versioning
Current version: **v1**
"""
