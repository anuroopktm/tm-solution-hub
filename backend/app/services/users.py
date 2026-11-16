from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


def get_all_users(db: Session, include_deleted: bool = False) -> list[User]:
    query = db.query(User)

    if not include_deleted:
        query = query.filter(User.is_deleted.is_(False))

    return query.order_by(User.created_at.desc()).all()


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(
    db: Session, email: str, exclude_id: UUID | None = None
) -> User | None:
    query = db.query(User).filter(User.email == email)

    if exclude_id is not None:
        query = query.filter(User.id != exclude_id)

    return query.first()


def create_user(db: Session, payload: UserCreate) -> User:
    user = User(
        **payload.model_dump(exclude={"password"}),
        password_hash=get_password_hash(payload.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def update_user(db: Session, user: User, payload: UserUpdate) -> User:
    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    return user


def soft_delete_user(db: Session, user: User) -> User:
    user.is_deleted = True
    user.deleted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(user)

    return user


def restore_user(db: Session, user: User) -> User:
    user.is_deleted = False
    user.deleted_at = None

    db.commit()
    db.refresh(user)

    return user


def hard_delete_user(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()
