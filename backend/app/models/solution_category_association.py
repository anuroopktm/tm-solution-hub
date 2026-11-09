from datetime import datetime
import uuid

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SolutionCategoryAssociation(Base):
    __tablename__ = "solution_category_associations"

    solution_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("solutions.id", ondelete="CASCADE"),
        primary_key=True,
    )

    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("categories.id", ondelete="CASCADE"),
        primary_key=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    solution = relationship(
        "Solution",
        back_populates="category_associations",
    )

    category = relationship(
        "Category",
        back_populates="solution_associations",
    )
