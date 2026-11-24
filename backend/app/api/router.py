"""Central API Router for FastAPI REST endpoints."""

from fastapi import APIRouter

from app.api.endpoints import (
    auth,
    categories,
    chat,
    conversations,
    dashboard,
    solutions,
    storage,
    users,
)

api_router = APIRouter(prefix="/api")

api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"],
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"],
)

api_router.include_router(
    solutions.router,
    prefix="/solutions",
    tags=["Solutions"],
)

api_router.include_router(
    categories.router,
    prefix="/categories",
    tags=["Categories"],
)

api_router.include_router(
    conversations.router,
    prefix="/conversations",
    tags=["Conversations"],
)

api_router.include_router(
    chat.router,
    prefix="/chat",
    tags=["Chat"],
)

api_router.include_router(
    storage.router,
    prefix="/storage",
    tags=["Storage"],
)
