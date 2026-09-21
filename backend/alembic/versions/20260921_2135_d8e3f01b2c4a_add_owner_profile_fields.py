"""add_owner_profile_fields_to_users

Revision ID: d8e3f01b2c4a
Revises: c7d2f89a1b3e
Create Date: 2026-09-21 21:35:00.000000+00:00

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd8e3f01b2c4a'
down_revision: Union[str, None] = 'c7d2f89a1b3e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('business_name', sa.String(length=150), nullable=True))
    op.add_column('users', sa.Column('address', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'bio')
    op.drop_column('users', 'address')
    op.drop_column('users', 'business_name')
