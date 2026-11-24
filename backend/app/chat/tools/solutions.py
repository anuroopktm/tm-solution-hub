"""Solution discovery and inspection tools for TM Solution Hub."""

from typing import Any
from langchain_core.tools import tool

from app.core.database import SessionLocal
from app.chat.tools.formatters import format_solution_detail, format_solution_summary
from app.services import solutions as solution_service


@tool
def search_solutions(
    query: str = "",
    category: str | None = None,
    tech_stack: list[str] | None = None,
    limit: int = 5,
) -> dict[str, Any]:
    """Search solutions in TM Solution Hub by keyword, category, or tech stack.

    Args:
        query: Keywords to match across title, description, or tech stack.
        category: Filter by business or technical domain name (e.g. 'Finance', 'Artificial Intelligence').
        tech_stack: List of technologies to filter by (e.g. ['FastAPI', 'React']).
        limit: Maximum number of solutions to return (default 5, max 5).

    Returns:
        Dictionary containing matched solutions and summary count.
    """
    safe_limit = max(1, min(limit, 5))
    with SessionLocal() as db:
        solutions = solution_service.search_solutions(
            db=db,
            query=query if query else None,
            category=category,
            tech_stack=tech_stack,
            limit=safe_limit,
        )

        return {
            "total_matches": len(solutions),
            "solutions": [format_solution_summary(s) for s in solutions[:safe_limit]],
        }


@tool
def get_solution_details(identifier: str) -> dict[str, Any]:
    """Retrieve technical and architectural details for a solution.

    Args:
        identifier: The UUID string or exact title of the solution.

    Returns:
        Dictionary containing solution profile, key documents, demo videos, and live service URLs.
    """
    with SessionLocal() as db:
        solution = solution_service.get_solution_detail_by_code_or_id(
            db, identifier.strip()
        )
        if not solution:
            return {
                "found": False,
                "message": f"Solution with ID or title '{identifier}' was not found.",
            }

        return {
            "found": True,
            "solution": format_solution_detail(solution),
        }


@tool
def list_recent_solutions(limit: int = 4) -> dict[str, Any]:
    """Fetch the most recently added or updated solutions in TM Solution Hub.

    Args:
        limit: Number of recent solutions to return (default 4, max 5).

    Returns:
        List of recent solution summary cards.
    """
    safe_limit = max(1, min(limit, 5))
    with SessionLocal() as db:
        solutions = solution_service.get_recent_solutions(db=db, limit=safe_limit)
        return {
            "count": len(solutions),
            "solutions": [format_solution_summary(s) for s in solutions[:safe_limit]],
        }


@tool
def filter_solutions_by_tech(
    technologies: list[str],
    match_all: bool = False,
    limit: int = 5,
) -> dict[str, Any]:
    """Find solutions using specific technologies in their tech stack.

    Args:
        technologies: List of technology tags to search for (e.g. ['FastAPI', 'PostgreSQL']).
        match_all: If True, solutions must contain ALL listed technologies. If False, solutions containing ANY match.
        limit: Maximum number of solutions to return (default 5, max 5).

    Returns:
        Matched solutions utilizing the requested tech stack.
    """
    safe_limit = max(1, min(limit, 5))
    with SessionLocal() as db:
        solutions = solution_service.filter_solutions_by_tech(
            db=db,
            technologies=technologies,
            match_all=match_all,
            limit=safe_limit,
        )
        return {
            "technologies_queried": technologies,
            "match_mode": "all" if match_all else "any",
            "total_matches": len(solutions),
            "solutions": [format_solution_summary(s) for s in solutions[:safe_limit]],
        }
