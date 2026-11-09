from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.base import BaseResponse
from app.schemas.solution import (
    SolutionCreate,
    SolutionDetailResponse,
    SolutionResponse,
    SolutionUpdate,
)
from app.services import solutions as solution_service

router = APIRouter()


@router.get(
    "/",
    response_model=list[SolutionResponse],
)
def get_solutions(
    db: Session = Depends(get_db),
):
    return solution_service.get_solutions(db)


@router.get("/recent", response_model=BaseResponse[list[SolutionResponse]])
def get_recent_solutions(db: Session = Depends(get_db)):
    solutions = solution_service.get_recent_solutions(db)

    return BaseResponse(
        detail="Recent solutions retrieved successfully",
        data=solutions,
    )


@router.get("/{solution_id}", response_model=BaseResponse[SolutionDetailResponse])
def get_solution(solution_id: UUID, db: Session = Depends(get_db)):
    solution = solution_service.get_solution_by_id(db, solution_id)

    if not solution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solution not found",
        )

    return BaseResponse(
        detail="Solution retrieved successfully",
        data=solution,
    )


@router.post(
    "/",
    response_model=BaseResponse[SolutionDetailResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_solution(payload: SolutionCreate, db: Session = Depends(get_db)):
    # Check unique code
    existing_code = solution_service.get_solution_by_code(db, payload.code)
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Solution with code '{payload.code}' already exists",
        )

    # Validate lead_id if provided
    if payload.lead_id:
        lead_user = db.query(User).filter(User.id == payload.lead_id).first()
        if not lead_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead user not found",
            )

    solution = solution_service.create_solution(db, payload)

    return BaseResponse(
        detail="Solution created successfully",
        data=solution,
    )


@router.put(
    "/{solution_id}",
    response_model=BaseResponse[SolutionDetailResponse],
    status_code=status.HTTP_200_OK,
)
def update_solution(
    solution_id: UUID,
    payload: SolutionUpdate,
    db: Session = Depends(get_db),
):
    solution = solution_service.get_solution_by_id(db, solution_id)

    if not solution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solution not found",
        )

    if payload.code:
        existing_code = solution_service.get_solution_by_code(
            db, payload.code, exclude_id=solution_id
        )
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Solution with code '{payload.code}' already exists",
            )

    if payload.lead_id:
        lead_user = db.query(User).filter(User.id == payload.lead_id).first()
        if not lead_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead user not found",
            )

    solution = solution_service.update_solution(db, solution, payload)

    return BaseResponse(
        detail="Solution updated successfully",
        data=solution,
    )


@router.delete(
    "/{solution_id}", response_model=BaseResponse[None], status_code=status.HTTP_200_OK
)
def delete_solution(
    solution_id: UUID, db: Session = Depends(get_db)
) -> BaseResponse[None]:
    solution = solution_service.get_solution_by_id(db, solution_id)

    if not solution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solution not found",
        )

    solution_service.delete_solution(db, solution)

    return BaseResponse(detail="Solution deleted successfully")
