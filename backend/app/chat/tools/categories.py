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
        List of categories with name, description, and number of solutions.
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
                    "description": c.description,
                    "solutions_count": len(c.solution_associations),
                }
                for c in categories
            ],
        }


@tool
def get_solutions_by_category(category_name_or_id: str) -> dict[str, Any]:
    """Retrieve all solutions categorized under a specific business or technical domain.

    Args:
        category_name_or_id: The category name (e.g. 'Artificial Intelligence', 'Finance and Accounting')
                             or UUID of the category.

    Returns:
        Category metadata and the list of solutions belonging to it.
    """
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

        # Query all solutions for this category
        solution_ids = [assoc.solution_id for assoc in category.solution_associations]
        solutions: list[Solution] = (
            db.query(Solution)
            .filter(Solution.id.in_(solution_ids))
            .order_by(Solution.title.asc())
            .all()
            if solution_ids
            else []
        )

        return {
            "found": True,
            "category": {
                "id": str(category.id),
                "name": category.name,
                "description": category.description,
            },
            "total_solutions": len(solutions),
            "solutions": [format_solution_summary(s) for s in solutions],
        }
