"""create users table and seed admin

Revision ID: 7334b575b277
Revises:
Create Date: 2026-11-04 15:52:18.635634
"""

import os
import uuid
import sqlalchemy as sa

from typing import Sequence, Union
from alembic import op
from pwdlib import PasswordHash

revision: str = "7334b575b277"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "users",
        sa.Column(
            "id",
            sa.Uuid(as_uuid=True),
            primary_key=True,
            default=uuid.uuid4,
        ),
        sa.Column("username", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )

    # Create predefined admin user
    admin_username = os.environ["ADMIN_USERNAME"]
    admin_email = os.environ["ADMIN_EMAIL"].strip().lower()
    admin_password = os.environ["ADMIN_PASSWORD"]

    password_hash = PasswordHash.recommended()
    hashed_password = password_hash.hash(admin_password)

    users = sa.table(
        "users",
        sa.column("id", sa.Uuid(as_uuid=True)),
        sa.column("username", sa.String),
        sa.column("email", sa.String),
        sa.column("password_hash", sa.String),
    )

    op.bulk_insert(
        users,
        [
            {
                "id": uuid.uuid4(),
                "username": admin_username,
                "email": admin_email,
                "password_hash": hashed_password,
            }
        ],
    )


def downgrade():
    op.drop_table("users")
