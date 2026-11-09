from datetime import datetime
import enum
from typing import Any
import uuid

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.associationproxy import association_proxy

from app.core.database import Base


class SolutionStatus(str, enum.Enum):
    PRODUCTION_READY = "production_ready"
    STAGING = "staging"
    DEVELOPMENT = "development"
    ARCHIVED = "archived"


class Solution(Base):
    __tablename__ = "solutions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # UI: Project Code (e.g. PRJ-TM-2026-08)
    code: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )

    # UI: Title & Subtitle / Tagline
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    tagline: Mapped[str | None] = mapped_column(String(250), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # UI: Status & Version badges
    status: Mapped[SolutionStatus] = mapped_column(
        String(50), default=SolutionStatus.DEVELOPMENT, nullable=False
    )
    version: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # UI: Repository URL
    repository_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # UI: Tech Stack chips (PostgreSQL Array or JSONB)
    tech_stack: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, nullable=False
    )

    # UI: Key Capabilities list
    key_capabilities: Mapped[list[dict[str, Any]] | None] = mapped_column(
        JSONB, nullable=True
    )

    # UI: Lead Architect / Owner
    lead_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    lead = relationship("User", back_populates="managed_solutions")

    # Categories
    category_associations = relationship(
        "SolutionCategoryAssociation",
        back_populates="solution",
        cascade="all, delete-orphan",
    )
    categories = association_proxy("category_associations", "category")

    # Child Relationships matching UI sections
    documents: Mapped[list["SolutionDocument"]] = relationship(
        "SolutionDocument", back_populates="solution", cascade="all, delete-orphan"
    )
    videos: Mapped[list["SolutionVideo"]] = relationship(
        "SolutionVideo", back_populates="solution", cascade="all, delete-orphan"
    )
    service_urls: Mapped[list["SolutionServiceUrl"]] = relationship(
        "SolutionServiceUrl", back_populates="solution", cascade="all, delete-orphan"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class SolutionDocument(Base):
    __tablename__ = "solution_documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    solution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("solutions.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    format: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # PDF, PPTX, DOCX, XLSX
    file_size_bytes: Mapped[int | None] = mapped_column(nullable=True)
    file_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    solution = relationship("Solution", back_populates="documents")


class SolutionVideo(Base):
    __tablename__ = "solution_videos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    solution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("solutions.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    video_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    duration_seconds: Mapped[int | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    solution = relationship("Solution", back_populates="videos")


class SolutionServiceUrl(Base):
    __tablename__ = "solution_service_urls"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    solution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("solutions.id", ondelete="CASCADE"),
        nullable=False,
    )
    service_name: Mapped[str] = mapped_column(String(150), nullable=False)
    service_type: Mapped[str] = mapped_column(
        String(100), nullable=False
    )  # Frontend, Swagger/API, etc.
    environment: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # Production, Staging
    target_url: Mapped[str] = mapped_column(String(1000), nullable=False)

    solution = relationship("Solution", back_populates="service_urls")
