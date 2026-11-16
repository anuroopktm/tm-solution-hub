"""Analytics, metrics, and multi-solution comparison tools for TM Solution Hub."""

from collections import Counter
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import selectinload

from app.mcp.db import get_mcp_db
from app.mcp.formatters import format_solution_detail
from app.mcp.server import mcp
from app.models.category import Category
from app.models.solution import Solution
from app.services import solutions as solution_service


@mcp.tool()
def compare_solutions(solution_identifiers: list[str]) -> dict[str, Any]:
    """Compare two or more solutions side-by-side.

    Analyzes differences and commonalities across tech stack, capabilities, and repository links.

    Args:
        solution_identifiers: List of solution titles or UUIDs.

    Returns:
        Structured side-by-side comparison including shared and distinct technologies.
    """
    if len(solution_identifiers) < 2:
        return {
            "error": "Please provide at least 2 solution identifiers to compare.",
            "compared_count": len(solution_identifiers),
        }

    with get_mcp_db() as db:
        detailed_solutions: list[Solution] = []
        missing: list[str] = []

        for ident in solution_identifiers:
            s = solution_service.get_solution_detail_by_code_or_id(db, ident.strip())
            if s:
                detailed_solutions.append(s)
            else:
                missing.append(ident)

        if not detailed_solutions:
            return {
                "error": "None of the specified solutions were found.",
                "missing": missing,
            }

        # Analyze tech stack overlap
        tech_sets: list[set[str]] = [
            set(s.tech_stack) for s in detailed_solutions if s.tech_stack
        ]

        shared_set: set[str] = set()
        if tech_sets:
            shared_set = set(tech_sets[0])
            for st in tech_sets[1:]:
                shared_set = shared_set.intersection(st)
        shared_tech: list[str] = sorted(shared_set)

        all_set: set[str] = set()
        for st in tech_sets:
            all_set = all_set.union(st)
        all_tech: list[str] = sorted(all_set)

        return {
            "compared_count": len(detailed_solutions),
            "missing_identifiers": missing,
            "tech_stack_analysis": {
                "shared_technologies": shared_tech,
                "all_unique_technologies": all_tech,
            },
            "solutions": [format_solution_detail(s) for s in detailed_solutions],
        }


@mcp.tool()
def get_hub_metrics() -> dict[str, Any]:
    """Get high-level summary metrics of TM Solution Hub.

    Provides total solutions, top tech stack usage, and category breakdown.

    Returns:
        Aggregated hub statistics.
    """
    with get_mcp_db() as db:
        total_solutions: int = db.query(func.count(Solution.id)).scalar() or 0

        # Tech stack frequencies
        all_tech_stacks = db.query(Solution.tech_stack).all()
        tech_counter: Counter[str] = Counter()
        for (stack,) in all_tech_stacks:
            if stack:
                tech_counter.update(stack)

        top_tech_stack: list[dict[str, Any]] = [
            {"technology": tech, "count": count}
            for tech, count in tech_counter.most_common(10)
        ]

        # Category breakdown
        categories = (
            db.query(Category)
            .options(selectinload(Category.solution_associations))
            .order_by(Category.name.asc())
            .all()
        )
        category_breakdown: list[dict[str, Any]] = [
            {
                "category_name": c.name,
                "solution_count": len(c.solution_associations),
            }
            for c in categories
        ]

        return {
            "total_solutions": total_solutions,
            "top_technologies": top_tech_stack,
            "category_breakdown": category_breakdown,
        }
