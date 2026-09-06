from datetime import datetime, date, timezone
from uuid import UUID
from sqlalchemy import String, Numeric, Text, ForeignKey, DateTime, Date, Boolean
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class Payout(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "payouts"

    payout_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    owner_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    gross_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    commission_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=10.00, nullable=False)  # 10.0%
    commission_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    net_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    earnings_period: Mapped[str] = mapped_column(String(50), nullable=False)  # "Aug 1–15, 2026"
    period_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    period_end: Mapped[date | None] = mapped_column(Date, nullable=True)

    payout_method: Mapped[str] = mapped_column(String(30), nullable=False)  # "bank_transfer", "bkash", "nagad", "rocket"
    account_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    account_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    bank_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    routing_number: Mapped[str | None] = mapped_column(String(20), nullable=True)

    status: Mapped[str] = mapped_column(String(20), default="pending", index=True, nullable=False)  # "pending", "processing", "paid", "failed"
    disbursement_trx_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    disbursed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    owner: Mapped["User"] = relationship("User", foreign_keys=[owner_id])  # type: ignore

    def __repr__(self) -> str:
        return f"<Payout {self.payout_id} Owner={self.owner_id} Net=৳{self.net_amount} Status={self.status}>"
