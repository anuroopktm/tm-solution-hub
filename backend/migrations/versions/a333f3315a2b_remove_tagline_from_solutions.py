"""remove_tagline_from_solutions

Revision ID: a333f3315a2b
Revises: de1f6b3b8f5d
Create Date: 2026-11-12 15:13:41.886209

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "a333f3315a2b"
down_revision: Union[str, Sequence[str], None] = "de1f6b3b8f5d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column("solutions", "tagline")


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column(
        "solutions",
        sa.Column("tagline", sa.String(length=250), nullable=True),
    )
