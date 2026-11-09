from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SolutionCategoryAssociationBase(BaseModel):
    solution_id: UUID
    category_id: int


class SolutionCategoryAssociationCreate(SolutionCategoryAssociationBase):
    pass


class SolutionCategoryAssociationResponse(SolutionCategoryAssociationBase):
    model_config = ConfigDict(from_attributes=True)
