from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.solution import SolutionStatus
from app.schemas.category import CategoryResponse
from app.schemas.user import UserResponse


# --- Child Schemas ---
class SolutionDocumentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)
    format: str = Field(..., max_length=20)
    file_size_bytes: int | None = None
    file_url: str = Field(..., max_length=1000)


class SolutionDocumentCreate(SolutionDocumentBase):
    pass


class SolutionDocumentResponse(SolutionDocumentBase):
    id: UUID
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SolutionVideoBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    thumbnail_url: str | None = Field(default=None, max_length=1000)
    video_url: str = Field(..., max_length=1000)
    duration_seconds: int | None = None


class SolutionVideoCreate(SolutionVideoBase):
    pass


class SolutionVideoResponse(SolutionVideoBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SolutionServiceUrlBase(BaseModel):
    service_name: str = Field(..., min_length=1, max_length=150)
    service_type: str = Field(..., max_length=100)
    environment: str = Field(..., max_length=50)
    target_url: str = Field(..., max_length=1000)


class SolutionServiceUrlCreate(SolutionServiceUrlBase):
    pass


class SolutionServiceUrlResponse(SolutionServiceUrlBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# --- Solution Schemas ---
class SolutionBase(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=1, max_length=150)
    tagline: str | None = Field(default=None, max_length=250)
    description: str | None = None
    status: SolutionStatus = SolutionStatus.DEVELOPMENT
    version: str | None = Field(default=None, max_length=50)
    repository_url: str | None = Field(default=None, max_length=500)
    tech_stack: list[str] = Field(default_factory=list[str])
    key_capabilities: list[dict[str, Any]] | None = None
    lead_id: UUID | None = None


class SolutionCreate(SolutionBase):
    category_ids: list[UUID] = Field(default_factory=list[UUID])
    documents: list[SolutionDocumentCreate] = Field(
        default_factory=list[SolutionDocumentCreate]
    )
    videos: list[SolutionVideoCreate] = Field(default_factory=list[SolutionVideoCreate])
    service_urls: list[SolutionServiceUrlCreate] = Field(
        default_factory=list[SolutionServiceUrlCreate]
    )


class SolutionUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=50)
    title: str | None = Field(default=None, min_length=1, max_length=150)
    tagline: str | None = Field(default=None, max_length=250)
    description: str | None = None
    status: SolutionStatus | None = None
    version: str | None = Field(default=None, max_length=50)
    repository_url: str | None = Field(default=None, max_length=500)
    tech_stack: list[str] | None = None
    key_capabilities: list[dict[str, Any]] | None = None
    lead_id: UUID | None = None
    category_ids: list[UUID] | None = None
    documents: list[SolutionDocumentCreate] | None = None
    videos: list[SolutionVideoCreate] | None = None
    service_urls: list[SolutionServiceUrlCreate] | None = None


class SolutionResponse(SolutionBase):
    id: UUID
    lead: UserResponse | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SolutionDetailResponse(SolutionResponse):
    categories: list[CategoryResponse] = Field(default_factory=list[CategoryResponse])
    documents: list[SolutionDocumentResponse] = Field(
        default_factory=list[SolutionDocumentResponse]
    )
    videos: list[SolutionVideoResponse] = Field(
        default_factory=list[SolutionVideoResponse]
    )
    service_urls: list[SolutionServiceUrlResponse] = Field(
        default_factory=list[SolutionServiceUrlResponse]
    )
