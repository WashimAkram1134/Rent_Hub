"""add_cover_image_url_to_users

Revision ID: c7d2f89a1b3e
Revises: 816a38778d17
Create Date: 2026-09-21 21:15:00.000000+00:00

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c7d2f89a1b3e'
down_revision: Union[str, None] = '816a38778d17'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('cover_image_url', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'cover_image_url')
