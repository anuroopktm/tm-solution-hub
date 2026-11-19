from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from app.models.category import Category
from app.models.solution import Solution
from app.schemas.dashboard import (
    CategoryDistributionItem,
    DashboardStatsResponse,
    DashboardTotals,
)


def get_dashboard_stats(db: Session, recent_limit: int = 5) -> DashboardStatsResponse:
    # 1. Total counts
    total_solutions = db.query(func.count(Solution.id)).scalar() or 0
    total_categories = db.query(func.count(Category.id)).scalar() or 0

    # 2. Get recent solution IDs
    recent_records = (
        db.query(Solution.id)
        .order_by(Solution.created_at.desc())
        .limit(recent_limit)
        .all()
    )
    recent_ids = {r[0] for r in recent_records}
    total_recent = len(recent_ids)

    # 3. Categories distribution
    categories = (
        db.query(Category)
        .options(selectinload(Category.solution_associations))
        .order_by(Category.name.asc())
        .all()
    )

    distribution: list[CategoryDistributionItem] = []
    for cat in categories:
        cat_solution_ids = {assoc.solution_id for assoc in cat.solution_associations}
        distribution.append(
            CategoryDistributionItem(
                id=cat.id,
                name=cat.name,
                total=len(cat_solution_ids),
                recent=len(cat_solution_ids & recent_ids),
            )
        )

    # Sort by solution count descending, then alphabetically by name
    distribution.sort(key=lambda item: (-item.total, item.name))

    return DashboardStatsResponse(
        totals=DashboardTotals(
            solutions=total_solutions,
            categories=total_categories,
            recent=total_recent,
        ),
        categories_distribution=distribution,
    )
