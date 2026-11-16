from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.conversation import Conversation, Message


def create_conversation(
    db: Session,
    user_id: UUID,
    title: str | None = None,
) -> Conversation:
    clean_title = title.strip() if title and title.strip() else "New Chat"

    conversation = Conversation(
        user_id=user_id,
        title=clean_title,
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def get_user_conversations(
    db: Session,
    user_id: UUID,
    skip: int = 0,
    limit: int = 50,
) -> list[Conversation]:
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_conversation(
    db: Session,
    user_id: UUID,
    conversation_id: UUID,
) -> Conversation | None:
    return (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
        .first()
    )


def update_conversation_title(
    db: Session,
    user_id: UUID,
    conversation_id: UUID,
    title: str,
) -> Conversation | None:
    conversation = get_conversation(db, user_id, conversation_id)
    if not conversation:
        return None

    conversation.title = title.strip()
    db.commit()
    db.refresh(conversation)

    return conversation


def delete_conversation(
    db: Session,
    user_id: UUID,
    conversation_id: UUID,
) -> bool:
    conversation = get_conversation(db, user_id, conversation_id)
    if not conversation:
        return False

    db.delete(conversation)
    db.commit()

    return True


def add_message(
    db: Session,
    conversation_id: UUID,
    role: str,
    content: str,
) -> Message:
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
    )
    db.add(message)

    # Touch updated_at timestamp on the conversation
    conversation = (
        db.query(Conversation).filter(Conversation.id == conversation_id).first()
    )
    if conversation:
        conversation.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(message)

    return message


def get_conversation_messages(
    db: Session,
    user_id: UUID,
    conversation_id: UUID,
) -> list[Message] | None:
    # Strict ownership check
    conversation = get_conversation(db, user_id, conversation_id)
    if not conversation:
        return None

    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )
