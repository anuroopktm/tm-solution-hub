"""Central API Router for FastAPI REST endpoints."""

from fastapi import APIRouter

from app.endpoints import auth, categories, chat, conversations, solutions, users

api_router = APIRouter(prefix="/api")

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
