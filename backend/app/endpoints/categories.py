from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.base import BaseResponse
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.core.database import get_db
from app.services import categories as category_service

router = APIRouter()


@router.get("/", response_model=BaseResponse[list[CategoryResponse]])
def get_categories(db: Session = Depends(get_db)):
    categories = category_service.get_categories(db)

    return BaseResponse(
        detail="Categories retrieved successfully",
        data=categories,
    )


@router.get("/{category_id}", response_model=BaseResponse[CategoryResponse])
def get_category(category_id: UUID, db: Session = Depends(get_db)):
    category = category_service.get_category_by_id(db, category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return BaseResponse(
        detail="Category retrieved successfully",
        data=category,
    )


@router.post(
    "/",
    response_model=BaseResponse[CategoryResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    existing_category = category_service.get_category_by_name(db, payload.name)

    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category already exists",
        )

    category = category_service.create_category(db, payload)

    return BaseResponse(
        detail="Category created successfully",
        data=category,
    )


@router.put(
    "/{category_id}",
    response_model=BaseResponse[CategoryResponse],
)
def update_category(
    category_id: UUID,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
):
    category = category_service.get_category_by_id(db, category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    if "name" in update_data:
        existing_category = category_service.get_category_by_name(
            db, update_data["name"], exclude_id=category_id
        )

        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Category name already exists",
            )

    updated_category = category_service.update_category(db, category, payload)

    return BaseResponse(
        detail="Category updated successfully",
        data=updated_category,
    )


@router.delete(
    "/{category_id}",
    response_model=BaseResponse[None],
)
def delete_category(
    category_id: UUID,
    db: Session = Depends(get_db),
):
    category = category_service.get_category_by_id(db, category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    category_service.delete_category(db, category)

    return BaseResponse[None](
        detail="Category deleted successfully",
    )
