"""add_icon_and_thumbnail_to_categories

Revision ID: c555d6637e4d
Revises: b444c5526d3c
Create Date: 2026-11-16 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "c555d6637e4d"
down_revision: Union[str, Sequence[str], None] = "b444c5526d3c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "categories",
        sa.Column("icon", sa.String(length=100), nullable=True),
    )
    op.add_column(
        "categories",
        sa.Column("thumbnail_url", sa.String(length=1000), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("categories", "thumbnail_url")
    op.drop_column("categories", "icon")
