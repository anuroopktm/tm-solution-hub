"""Data formatting utilities for LangGraph tools in TM Solution Hub."""

from typing import Any

from app.models.solution import Solution


def format_solution_summary(solution: Solution) -> dict[str, Any]:
    """Format a solution into a concise summary card for LLM context."""
    lead_dict: dict[str, str] | None = None
    if solution.lead:
        lead_dict = {
            "username": solution.lead.username,
            "email": solution.lead.email,
        }

    categories_list: list[str] = [
        assoc.category.name
        for assoc in solution.category_associations
        if assoc.category
    ]

    return {
        "id": str(solution.id),
        "title": solution.title,
        "description": solution.description,
        "tech_stack": list(solution.tech_stack) if solution.tech_stack else [],
        "categories": categories_list,
        "lead": lead_dict,
        "repository_url": solution.repository_url,
    }


def format_solution_detail(solution: Solution) -> dict[str, Any]:
    """Format full solution details including documents, videos, and live environments."""
    lead_dict: dict[str, str] | None = None
    if solution.lead:
        lead_dict = {
            "username": solution.lead.username,
            "email": solution.lead.email,
        }

    categories_list: list[str] = [
        assoc.category.name
        for assoc in solution.category_associations
        if assoc.category
    ]

    documents_list: list[dict[str, Any]] = [
        {
            "name": doc.name,
            "description": doc.description,
            "format": doc.format,
            "file_url": doc.file_url,
        }
        for doc in solution.documents
    ]

    videos_list: list[dict[str, Any]] = [
        {
            "title": vid.title,
            "description": vid.description,
            "video_url": vid.video_url,
            "duration_seconds": vid.duration_seconds,
        }
        for vid in solution.videos
    ]

    service_urls_list: list[dict[str, Any]] = [
        {
            "service_name": s.service_name,
            "service_type": s.service_type,
            "environment": s.environment,
            "target_url": s.target_url,
        }
        for s in solution.service_urls
    ]

    return {
        "id": str(solution.id),
        "title": solution.title,
        "description": solution.description,
        "tech_stack": list(solution.tech_stack) if solution.tech_stack else [],
        "key_capabilities": solution.key_capabilities or [],
        "categories": categories_list,
        "lead": lead_dict,
        "repository_url": solution.repository_url,
        "documents": documents_list,
        "videos": videos_list,
        "service_urls": service_urls_list,
        "created_at": (
            solution.created_at.isoformat() if solution.created_at else None
        ),
        "updated_at": (
            solution.updated_at.isoformat() if solution.updated_at else None
        ),
    }
