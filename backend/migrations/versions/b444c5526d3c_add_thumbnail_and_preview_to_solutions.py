"""add_thumbnail_and_preview_to_solutions

Revision ID: b444c5526d3c
Revises: a333f3315a2b
Create Date: 2026-11-16 11:18:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "b444c5526d3c"
down_revision: Union[str, Sequence[str], None] = "a333f3315a2b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "solutions",
        sa.Column("thumbnail_url", sa.String(length=1000), nullable=True),
    )
    op.add_column(
        "solutions",
        sa.Column("preview_url", sa.String(length=1000), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("solutions", "preview_url")
    op.drop_column("solutions", "thumbnail_url")
