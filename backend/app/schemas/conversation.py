from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ConversationCreate(BaseModel):
    title: str | None = Field(default=None, max_length=255)


class ConversationUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=255)


class MessageBase(BaseModel):
    role: str = Field(max_length=20)
    content: str


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: UUID
    conversation_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationDetailResponse(ConversationResponse):
    messages: list[MessageResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ConversationDeleteResponse(BaseModel):
    id: UUID
    detail: str = "Conversation deleted successfully"


class ChatStreamRequest(BaseModel):
    conversation_id: UUID | None = None
    message: str = Field(min_length=1)
