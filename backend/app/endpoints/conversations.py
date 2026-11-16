from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.base import BaseResponse
from app.schemas.conversation import (
    ConversationCreate,
    ConversationDeleteResponse,
    ConversationDetailResponse,
    ConversationResponse,
    ConversationUpdate,
    MessageResponse,
)
from app.services import conversation as conversation_service

router = APIRouter()


@router.post(
    "/",
    response_model=BaseResponse[ConversationResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_conversation(
    payload: ConversationCreate | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    title = payload.title if payload else None
    conversation = conversation_service.create_conversation(
        db=db,
        user_id=current_user.id,
        title=title,
    )

    return BaseResponse(
        detail="Conversation created successfully",
        data=conversation,
    )


@router.get(
    "/",
    response_model=BaseResponse[list[ConversationResponse]],
)
def list_conversations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversations = conversation_service.get_user_conversations(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )

    return BaseResponse(
        detail="Conversations retrieved successfully",
        data=conversations,
    )


@router.get(
    "/{conversation_id}",
    response_model=BaseResponse[ConversationDetailResponse],
)
def get_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = conversation_service.get_conversation(
        db=db,
        user_id=current_user.id,
        conversation_id=conversation_id,
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    return BaseResponse(
        detail="Conversation retrieved successfully",
        data=conversation,
    )


@router.patch(
    "/{conversation_id}",
    response_model=BaseResponse[ConversationResponse],
)
def update_conversation(
    conversation_id: UUID,
    payload: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = conversation_service.update_conversation_title(
        db=db,
        user_id=current_user.id,
        conversation_id=conversation_id,
        title=payload.title,
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    return BaseResponse(
        detail="Conversation updated successfully",
        data=conversation,
    )


@router.delete(
    "/{conversation_id}",
    response_model=BaseResponse[ConversationDeleteResponse],
)
def delete_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = conversation_service.delete_conversation(
        db=db,
        user_id=current_user.id,
        conversation_id=conversation_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    return BaseResponse(
        detail="Conversation deleted successfully",
        data=ConversationDeleteResponse(id=conversation_id),
    )


@router.get(
    "/{conversation_id}/messages",
    response_model=BaseResponse[list[MessageResponse]],
)
def get_messages(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = conversation_service.get_conversation_messages(
        db=db,
        user_id=current_user.id,
        conversation_id=conversation_id,
    )

    if messages is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    return BaseResponse(
        detail="Messages retrieved successfully",
        data=messages,
    )
