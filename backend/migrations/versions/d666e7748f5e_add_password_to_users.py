"""add_password_encrypted_to_users

Revision ID: d666e7748f5e
Revises: c555d6637e4d
Create Date: 2026-11-18 12:00:00.000000

"""

import os
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from app.core.security import encrypt_password

# revision identifiers, used by Alembic.
revision: str = "d666e7748f5e"
down_revision: Union[str, Sequence[str], None] = "c555d6637e4d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("password_encrypted", sa.String(length=500), nullable=True),
    )

    admin_password = os.environ.get("ADMIN_PASSWORD", "admin@12345")
    encrypted_admin = encrypt_password(admin_password)

    op.execute(
        sa.text(
            "UPDATE users SET password_encrypted = :pwd WHERE password_encrypted IS NULL"
        ).bindparams(pwd=encrypted_admin)
    )


def downgrade() -> None:
    op.drop_column("users", "password_encrypted")
