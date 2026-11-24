from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.base import BaseResponse
from app.schemas.dashboard import DashboardStatsResponse
from app.services import dashboard as dashboard_service

router = APIRouter()


@router.get("/stats", response_model=BaseResponse[DashboardStatsResponse])
def get_dashboard_stats(
    recent_limit: int = 5,
    db: Session = Depends(get_db),
):
    stats = dashboard_service.get_dashboard_stats(db, recent_limit=recent_limit)
    return BaseResponse(
        detail="Dashboard statistics retrieved successfully",
        data=stats,
    )
