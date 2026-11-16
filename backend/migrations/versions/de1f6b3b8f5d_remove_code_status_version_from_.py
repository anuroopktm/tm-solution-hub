"""remove_code_status_version_from_solutions

Revision ID: de1f6b3b8f5d
Revises: f73a6bc626c2
Create Date: 2026-11-12 14:43:22.736179

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "de1f6b3b8f5d"
down_revision: Union[str, Sequence[str], None] = "f73a6bc626c2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_index(op.f("ix_solutions_code"), table_name="solutions")
    op.drop_column("solutions", "code")
    op.drop_column("solutions", "status")
    op.drop_column("solutions", "version")


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column(
        "solutions", sa.Column("version", sa.String(length=50), nullable=True)
    )
    op.add_column(
        "solutions",
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=False,
            server_default="development",
        ),
    )
    op.add_column(
        "solutions",
        sa.Column(
            "code",
            sa.String(length=50),
            nullable=False,
            server_default="",
        ),
    )
    op.create_index(op.f("ix_solutions_code"), "solutions", ["code"], unique=True)
