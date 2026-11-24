from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import api_router
from app.chat.checkpointer import close_checkpointer_pool, get_checkpointer
from app.chat.graph import build_chat_graph
from app.core.config import settings
from app.core.cors import register_cors
from app.core.s3 import ensure_bucket_exists


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize LangGraph checkpointer and agent graph
    checkpointer = await get_checkpointer()
    app.state.checkpointer = checkpointer
    app.state.agent = build_chat_graph(checkpointer=checkpointer)

    # Ensure MinIO bucket exists
    ensure_bucket_exists()

    yield

    # Clean up PostgreSQL connection pool on shutdown
    await close_checkpointer_pool()


# Initialize standalone FastAPI Application with lifespan
app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
)

# Register CORS middleware
register_cors(app)

# Register FastAPI REST API routes (/api/...)
app.include_router(api_router)
