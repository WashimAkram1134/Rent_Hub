from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy import String, Numeric, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class Payment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "payments"

    transaction_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    gateway_trx_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    booking_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), index=True, nullable=False)
    customer_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    owner_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    subtotal: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    service_fee: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    security_deposit: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    delivery_fee: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)

    payment_method: Mapped[str] = mapped_column(String(30), nullable=False)  # "bkash", "nagad", "card", "rocket", "bank_transfer"
    payment_channel: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="paid", nullable=False, index=True)  # "paid", "pending", "failed", "refunded"
    currency: Mapped[str] = mapped_column(String(10), default="BDT", nullable=False)
    escrow_status: Mapped[str] = mapped_column(String(20), default="held", nullable=False)  # "held", "released", "refunded", "disputed"

    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    failure_code: Mapped[str | None] = mapped_column(String(50), nullable=True)

    refund_amount: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    refund_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    refund_trx_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    refunded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    booking: Mapped["Booking"] = relationship("Booking")  # type: ignore
    customer: Mapped["User"] = relationship("User", foreign_keys=[customer_id])  # type: ignore
    owner: Mapped["User"] = relationship("User", foreign_keys=[owner_id])  # type: ignore

    def __repr__(self) -> str:
        return f"<Payment {self.transaction_id} ৳{self.amount} - {self.status}>"
