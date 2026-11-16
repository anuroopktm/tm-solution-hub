from contextlib import contextmanager
from typing import Generator
from sqlalchemy.orm import Session

from app.core.database import SessionLocal


@contextmanager
def get_mcp_db() -> Generator[Session, None, None]:
    """Provide a transactional SQLAlchemy database session for MCP tools.

    Ensures proper cleanup and closing of the database session after tool
    execution, preventing connection leaks.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
