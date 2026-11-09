from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.api.deps import get_current_admin
from app.services import users as user_service

router = APIRouter()


@router.get(
    "/",
    response_model=list[UserResponse],
)
def get_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return user_service.get_all_users(db)
