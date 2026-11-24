"""Category and business domain exploration tools for TM Solution Hub."""

from typing import Any
from uuid import UUID

from langchain_core.tools import tool
from sqlalchemy.orm import selectinload

from app.core.database import SessionLocal
from app.chat.tools.formatters import format_solution_summary
from app.models.category import Category
from app.models.solution import Solution


@tool
def list_categories() -> dict[str, Any]:
    """List all solution categories/domains in TM Solution Hub along with solution counts.

    Returns:
        List of categories with name, brief description, and number of solutions.
    """
    with SessionLocal() as db:
        categories = (
            db.query(Category)
            .options(selectinload(Category.solution_associations))
            .order_by(Category.name.asc())
            .all()
        )

        return {
            "total_categories": len(categories),
            "categories": [
                {
                    "id": str(c.id),
                    "name": c.name,
                    "description": (
                        (c.description[:80] + "...")
                        if c.description and len(c.description) > 80
                        else (c.description or "")
                    ),
                    "solutions_count": len(c.solution_associations),
                }
                for c in categories
            ],
        }


@tool
def get_solutions_by_category(
    category_name_or_id: str, limit: int = 5
) -> dict[str, Any]:
    """Retrieve solutions categorized under a specific business or technical domain.

    Args:
        category_name_or_id: The category name (e.g. 'Artificial Intelligence', 'Finance and Accounting')
                             or UUID of the category.
        limit: Maximum number of solutions to return (default 5, max 5).

    Returns:
        Category metadata and concise list of solutions belonging to it.
    """
    safe_limit = max(1, min(limit, 5))
    with SessionLocal() as db:
        category = None
        try:
            val_uuid = UUID(category_name_or_id.strip())
            category = (
                db.query(Category)
                .options(selectinload(Category.solution_associations))
                .filter(Category.id == val_uuid)
                .first()
            )
        except (ValueError, AttributeError):
            pass

        # If not found by UUID, find by name (case-insensitive substring or exact match)
        if not category:
            pattern = f"%{category_name_or_id.strip()}%"
            category = (
                db.query(Category)
                .options(selectinload(Category.solution_associations))
                .filter(Category.name.ilike(pattern))
                .first()
            )

        if not category:
            return {
                "found": False,
                "message": f"Category '{category_name_or_id}' was not found.",
                "solutions": [],
            }

        # Query solutions for this category with limit
        solution_ids = [assoc.solution_id for assoc in category.solution_associations]
        solutions: list[Solution] = (
            db.query(Solution)
            .filter(Solution.id.in_(solution_ids))
            .order_by(Solution.title.asc())
            .limit(safe_limit)
            .all()
            if solution_ids
            else []
        )

        return {
            "found": True,
            "category": {
                "id": str(category.id),
                "name": category.name,
            },
            "total_solutions": len(category.solution_associations),
            "solutions": [format_solution_summary(s) for s in solutions],
        }
