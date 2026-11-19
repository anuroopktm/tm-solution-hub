# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false
"""LangGraph checkpointer persistence provider."""

import logging
from typing import Any
from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg import AsyncConnection
from psycopg.rows import DictRow, dict_row
from psycopg_pool import AsyncConnectionPool

from app.core.config import settings

logger = logging.getLogger(__name__)

_pool: AsyncConnectionPool[AsyncConnection[DictRow]] | None = None


def get_connection_string() -> str:
    """Convert SQLAlchemy connection URL to standard PostgreSQL connection string."""
    url = settings.DATABASE_URL
    return url.replace("postgresql+psycopg://", "postgresql://")


async def get_checkpointer() -> BaseCheckpointSaver[Any]:
    """Initialize and return an AsyncPostgresSaver checkpointer.

    Creates required checkpoint tables in PostgreSQL if they do not exist.
    Falls back to MemorySaver if the database connection fails.
    """
    global _pool
    conn_str = get_connection_string()

    try:
        if _pool is None:
            _pool = AsyncConnectionPool(
                conninfo=conn_str,
                max_size=20,
                kwargs={
                    "autocommit": True,
                    "row_factory": dict_row,
                },
                open=False,
            )
            await _pool.open()

        checkpointer = AsyncPostgresSaver(_pool)
        await checkpointer.setup()
        logger.info("Initialized AsyncPostgresSaver checkpointer successfully.")
        return checkpointer

    except Exception as exc:
        logger.warning(
            "Failed to initialize AsyncPostgresSaver: %s. Falling back to MemorySaver.",
            exc,
        )
        return MemorySaver()


async def close_checkpointer_pool() -> None:
    """Close the underlying PostgreSQL connection pool on application shutdown."""
    global _pool
    if _pool is not None:
        try:
            await _pool.close()
        except Exception as exc:
            logger.warning("Error closing checkpointer connection pool: %s", exc)
        finally:
            _pool = None
