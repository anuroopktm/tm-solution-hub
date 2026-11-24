from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.user import User
from app.schemas.base import BaseResponse
from app.schemas.user import UserCreate, UserDeleteResponse, UserResponse, UserUpdate
from app.services import users as user_service

router = APIRouter()


@router.get(
    "/",
    response_model=BaseResponse[list[UserResponse]],
)
def get_users(
    search: str | None = None,
    include_deleted: bool = False,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> BaseResponse[list[UserResponse]]:
    users = user_service.get_all_users(
        db,
        include_deleted=include_deleted,
        search=search,
    )

    return BaseResponse(
        detail="Users fetched successfully",
        data=[UserResponse.model_validate(u) for u in users],
    )


@router.post(
    "/create",
    response_model=BaseResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> BaseResponse[UserResponse]:
    existing_user = user_service.get_user_by_email(db, payload.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    user = user_service.create_user(db, payload)

    return BaseResponse(
        detail="User created successfully",
        data=UserResponse.model_validate(user),
    )


@router.put(
    "/{user_id}",
    response_model=BaseResponse[UserResponse],
    status_code=status.HTTP_200_OK,
)
def update_user(
    user_id: UUID,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> BaseResponse[UserResponse]:
    user = user_service.get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update a deleted user",
        )

    if payload.email:
        existing_user = user_service.get_user_by_email(
            db, payload.email, exclude_id=user_id
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists",
            )

    updated_user = user_service.update_user(db, user, payload)

    return BaseResponse(
        detail="User updated successfully",
        data=UserResponse.model_validate(updated_user),
    )


@router.delete(
    "/{user_id}",
    response_model=BaseResponse[UserDeleteResponse],
    status_code=status.HTTP_200_OK,
)
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> BaseResponse[UserDeleteResponse]:
    user = user_service.get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already deleted",
        )

    user_service.soft_delete_user(db, user)

    return BaseResponse(
        detail="User deleted successfully",
        data=UserDeleteResponse(
            id=user.id,
            detail="User soft deleted successfully",
        ),
    )


@router.patch(
    "/{user_id}/restore",
    response_model=BaseResponse[UserResponse],
    status_code=status.HTTP_200_OK,
)
def restore_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> BaseResponse[UserResponse]:
    user = user_service.get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not deleted",
        )

    restored_user = user_service.restore_user(db, user)

    return BaseResponse(
        detail="User restored successfully",
        data=UserResponse.model_validate(restored_user),
    )


@router.delete(
    "/{user_id}/permanent",
    response_model=BaseResponse[UserDeleteResponse],
    status_code=status.HTTP_200_OK,
)
def hard_delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> BaseResponse[UserDeleteResponse]:
    user = user_service.get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    deleted_id = user.id

    user_service.hard_delete_user(db, user)

    return BaseResponse(
        detail="User permanently deleted",
        data=UserDeleteResponse(
            id=deleted_id,
            detail="User permanently deleted from database",
        ),
    )
