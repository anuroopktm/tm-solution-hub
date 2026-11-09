from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_token,
    verify_password,
)
from app.models.refresh_token import RefreshToken
from app.models.user import User


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    email = email.strip().lower()

    user = db.query(User).filter(User.email == email).first()

    if not user or not user.password_hash:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user


def issue_tokens_for_user(
    db: Session,
    user_id: UUID,
    endpoint: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> tuple[str, str]:
    access_token = create_access_token(user_id)
    raw_refresh_token, expires_at = create_refresh_token(user_id)

    token_hash = hash_token(raw_refresh_token)

    record = RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
        created_from_endpoint=endpoint,
        ip_address=ip_address,
        user_agent=user_agent,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return access_token, raw_refresh_token


def rotate_refresh_token(
    db: Session,
    raw_refresh_token: str,
    endpoint: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> tuple[str, str] | None:
    payload = decode_refresh_token(raw_refresh_token)
    if not payload or "sub" not in payload:
        return None

    token_hash = hash_token(raw_refresh_token)
    token_record = (
        db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    )

    if not token_record or token_record.revoked:
        return None

    if token_record.expires_at < datetime.now(timezone.utc):
        return None

    # Revoke old token upon rotation
    token_record.revoked = True

    db.commit()

    return issue_tokens_for_user(
        db,
        token_record.user_id,
        endpoint=endpoint,
        ip_address=ip_address,
        user_agent=user_agent,
    )


def revoke_refresh_token(db: Session, raw_refresh_token: str) -> bool:
    token_hash = hash_token(raw_refresh_token)
    token_record = (
        db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    )

    if not token_record or token_record.revoked:
        return False

    token_record.revoked = True

    db.commit()

    return True
