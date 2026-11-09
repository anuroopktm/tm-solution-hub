from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.solution import Solution
from app.schemas.solution import (
    SolutionCreate,
    SolutionDetailResponse,
    SolutionResponse,
    SolutionUpdate,
)
from app.models.category import Category

router = APIRouter()


@router.get(
    "/",
    response_model=list[SolutionResponse],
)
def get_solutions(
    db: Session = Depends(get_db),
):
    return db.query(Solution).order_by(Solution.created_at.desc()).all()


@router.get("recent", response_model=list[SolutionResponse])
def get_recent_solutions(db: Session = Depends(get_db)):
    return db.query(Solution).order_by(Solution.created_at.desc()).limit(5).all()


@router.get("/{solution_id}", response_model=SolutionDetailResponse)
def get_solution(solution_id: UUID, db: Session = Depends(get_db)):
    solution = db.query(Solution).filter(Solution.id == solution_id).first()

    if not solution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solution not found",
        )

    return solution


@router.post(
    "/",
    response_model=SolutionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_solution(payload: SolutionCreate, db: Session = Depends(get_db)):
    solution = Solution(**payload.model_dump())

    db.add(solution)
    db.commit()
    db.refresh(solution)

    return solution


@router.put("/{solution_id}", response_model=SolutionResponse,  status_code=status.HTTP_201_CREATED)
def update_solution(
    solution_id: UUID,
    payload: SolutionUpdate,
    db: Session = Depends(get_db),
):
    solution = db.query(Solution).filter(Solution.id == solution_id).first()

    if not solution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solution not found",
        )

    update_data = payload.model_dump(
        exclude_unset=True,
    )

    for field, value in update_data.items():
        setattr(solution, field, value)

    db.commit()
    db.refresh(update_data)

    return solution


@router.delete("/{solution_id}", status_code=status.H)
def delete_solution(solution_id: UUID, db: Session = Depends(get_db)):
    solution = db.query(Solution).filter(Solution.id == solution_id).first()

    if not solution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solution not found",
        )

    db.delete(solution)
    db.commit()
    
