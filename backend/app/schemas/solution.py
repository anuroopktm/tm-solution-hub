from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SolutionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: str | None = None
    tagline: str | None = Field(default=None, max_length=250)


class SolutionCreate(SolutionBase):
    category_ids: list[UUID] = Field(default_factory=list)


class SolutionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    tagline: str | None = Field(default=None, max_length=250)
    category_ids: list[UUID] | None = None


class SolutionResponse(SolutionBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


class SolutionDetailResponse(SolutionResponse):
    categories: list[CategoryResponse] = Field(default_factory=list)
