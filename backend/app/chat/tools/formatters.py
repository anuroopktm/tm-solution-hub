"""Data formatting utilities for LangGraph tools in TM Solution Hub."""

from typing import Any

from app.models.solution import Solution


def format_solution_summary(
    solution: Solution, max_desc_len: int = 180
) -> dict[str, Any]:
    """Format a solution into a concise summary card for LLM context."""
    categories_list: list[str] = [
        assoc.category.name
        for assoc in solution.category_associations
        if assoc.category
    ]

    desc = (solution.description or "").strip()
    if len(desc) > max_desc_len:
        desc = desc[:max_desc_len].rstrip() + "..."

    tech_stack = list(solution.tech_stack[:6]) if solution.tech_stack else []

    lead_name = solution.lead.username if solution.lead else None

    return {
        "id": str(solution.id),
        "title": solution.title,
        "description": desc,
        "tech_stack": tech_stack,
        "categories": categories_list,
        "lead": lead_name,
        "repository_url": solution.repository_url,
    }


def format_solution_detail(
    solution: Solution, max_desc_len: int = 400
) -> dict[str, Any]:
    """Format full solution details compactly to avoid token bloat."""
    categories_list: list[str] = [
        assoc.category.name
        for assoc in solution.category_associations
        if assoc.category
    ]

    desc = (solution.description or "").strip()
    if len(desc) > max_desc_len:
        desc = desc[:max_desc_len].rstrip() + "..."

    # Top capabilities with short descriptions
    capabilities = []
    if solution.key_capabilities and isinstance(solution.key_capabilities, list):
        for cap in solution.key_capabilities[:4]:
            if isinstance(cap, dict):
                c_name = cap.get("name", "")
                c_desc = cap.get("description", "")
                if len(c_desc) > 80:
                    c_desc = c_desc[:80].rstrip() + "..."
                capabilities.append(f"{c_name}: {c_desc}" if c_desc else c_name)
            elif isinstance(cap, str):
                capabilities.append(cap[:100])

    documents_list: list[dict[str, str]] = [
        {
            "name": doc.name,
            "format": doc.format,
            "url": doc.file_url,
        }
        for doc in solution.documents[:3]
    ]

    videos_list: list[dict[str, str]] = [
        {
            "title": vid.title,
            "url": vid.video_url,
        }
        for vid in solution.videos[:2]
    ]

    service_urls_list: list[dict[str, str]] = [
        {
            "service_name": s.service_name,
            "environment": s.environment,
            "url": s.target_url,
        }
        for s in solution.service_urls[:3]
    ]

    return {
        "id": str(solution.id),
        "title": solution.title,
        "description": desc,
        "tech_stack": list(solution.tech_stack[:8]) if solution.tech_stack else [],
        "key_capabilities": capabilities,
        "categories": categories_list,
        "lead": solution.lead.username if solution.lead else None,
        "repository_url": solution.repository_url,
        "documents": documents_list,
        "videos": videos_list,
        "service_urls": service_urls_list,
    }
