from __future__ import annotations

from sqlalchemy import Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class BackupSnapshot(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "backup_snapshots"

    snapshot_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    size_mb: Mapped[float] = mapped_column(Float, default=42.5, nullable=False)
    backup_type: Mapped[str] = mapped_column(String(50), default="Automated Daily", nullable=False)
    storage: Mapped[str] = mapped_column(String(100), default="S3 Singapore (ap-southeast-1)", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Healthy / Encrypted", nullable=False)

    def __repr__(self) -> str:
        return f"<BackupSnapshot {self.snapshot_code}>"
