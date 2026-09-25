from __future__ import annotations

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class AuditLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "audit_logs"

    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    admin_name: Mapped[str] = mapped_column(String(150), default="Admin Operator", nullable=False)
    target: Mapped[str] = mapped_column(String(255), default="System", nullable=False)
    ip_address: Mapped[str] = mapped_column(String(100), default="103.114.98.22", nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="INFO", nullable=False, index=True)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} - {self.title}>"
