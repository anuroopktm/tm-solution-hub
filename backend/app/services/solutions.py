from uuid import UUID

from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.category import Category
from app.models.solution import (
    Solution,
    SolutionDocument,
    SolutionServiceUrl,
    SolutionVideo,
)
from app.models.solution_category_association import SolutionCategoryAssociation
from app.schemas.solution import SolutionCreate, SolutionUpdate


def get_solutions_list(db: Session, category_id: UUID | None = None) -> list[Solution]:
    stmt = db.query(Solution)

    if category_id:
        stmt = stmt.filter(
            Solution.category_associations.any(
                SolutionCategoryAssociation.category_id == category_id
            )
        )

    return stmt.order_by(Solution.created_at.desc()).all()


def get_solutions(db: Session, category_id: UUID | None = None) -> list[Solution]:
    stmt = db.query(Solution).options(
        joinedload(Solution.lead),
        selectinload(Solution.category_associations).selectinload(
            SolutionCategoryAssociation.category
        ),
        selectinload(Solution.documents),
        selectinload(Solution.videos),
        selectinload(Solution.service_urls),
    )

    if category_id:
        stmt = stmt.filter(
            Solution.category_associations.any(
                SolutionCategoryAssociation.category_id == category_id
            )
        )

    return stmt.order_by(Solution.created_at.desc()).all()


def get_recent_solutions(db: Session, limit: int = 5) -> list[Solution]:
    return (
        db.query(Solution)
        .options(joinedload(Solution.lead))
        .order_by(Solution.created_at.desc())
        .limit(limit)
        .all()
    )


def get_solution_by_id(db: Session, solution_id: UUID) -> Solution | None:
    return (
        db.query(Solution)
        .options(
            joinedload(Solution.lead),
            selectinload(Solution.category_associations).selectinload(
                SolutionCategoryAssociation.category
            ),
            selectinload(Solution.documents),
            selectinload(Solution.videos),
            selectinload(Solution.service_urls),
        )
        .filter(Solution.id == solution_id)
        .first()
    )


def get_solution_detail_by_code_or_id(db: Session, identifier: str) -> Solution | None:
    """Fetch complete solution details with all relationships eagerly loaded,
    accepting either a UUID string or title.
    """
    try:
        val_uuid = UUID(identifier)
        return get_solution_by_id(db, val_uuid)
    except (ValueError, AttributeError):
        pass

    return (
        db.query(Solution)
        .options(
            joinedload(Solution.lead),
            selectinload(Solution.category_associations).selectinload(
                SolutionCategoryAssociation.category
            ),
            selectinload(Solution.documents),
            selectinload(Solution.videos),
            selectinload(Solution.service_urls),
        )
        .filter(Solution.title.ilike(identifier.strip()))
        .first()
    )


def search_solutions(
    db: Session,
    query: str | None = None,
    category: str | None = None,
    tech_stack: list[str] | None = None,
    limit: int = 10,
) -> list[Solution]:
    """Search solutions across title, description, and tech stack."""
    stmt = db.query(Solution).options(
        joinedload(Solution.lead),
        selectinload(Solution.category_associations).selectinload(
            SolutionCategoryAssociation.category
        ),
    )

    if query:
        search_pattern = f"%{query.strip()}%"
        stmt = stmt.filter(
            or_(
                Solution.title.ilike(search_pattern),
                Solution.description.ilike(search_pattern),
                func.array_to_string(Solution.tech_stack, " ").ilike(search_pattern),
            )
        )

    if category:
        stmt = stmt.filter(
            Solution.category_associations.any(
                SolutionCategoryAssociation.category.has(
                    Category.name.ilike(f"%{category.strip()}%")
                )
            )
        )

    if tech_stack:
        stmt = stmt.filter(Solution.tech_stack.overlap(tech_stack))

    return stmt.order_by(Solution.created_at.desc()).limit(limit).all()


def filter_solutions_by_tech(
    db: Session,
    technologies: list[str],
    match_all: bool = False,
    limit: int = 20,
) -> list[Solution]:
    """Filter solutions containing specified tech stack items."""
    stmt = db.query(Solution).options(
        joinedload(Solution.lead),
        selectinload(Solution.category_associations).selectinload(
            SolutionCategoryAssociation.category
        ),
    )

    if match_all:
        stmt = stmt.filter(Solution.tech_stack.contains(technologies))
    else:
        stmt = stmt.filter(Solution.tech_stack.overlap(technologies))

    return stmt.order_by(Solution.created_at.desc()).limit(limit).all()


def create_solution(db: Session, payload: SolutionCreate) -> Solution:
    data = payload.model_dump()
    category_ids = data.pop("category_ids", [])
    documents = data.pop("documents", [])
    videos = data.pop("videos", [])
    service_urls = data.pop("service_urls", [])

    solution = Solution(**data)

    if category_ids:
        categories = db.query(Category).filter(Category.id.in_(category_ids)).all()
        for cat in categories:
            solution.category_associations.append(
                SolutionCategoryAssociation(category=cat)
            )

    for doc in documents:
        solution.documents.append(SolutionDocument(**doc))

    for vid in videos:
        solution.videos.append(SolutionVideo(**vid))

    for s_url in service_urls:
        solution.service_urls.append(SolutionServiceUrl(**s_url))

    db.add(solution)
    db.commit()
    db.refresh(solution)

    return get_solution_by_id(db, solution.id) or solution


def update_solution(
    db: Session, solution: Solution, payload: SolutionUpdate
) -> Solution:
    update_data = payload.model_dump(exclude_unset=True)

    if "category_ids" in update_data:
        category_ids = update_data.pop("category_ids")
        if category_ids is not None:
            solution.category_associations.clear()
            if category_ids:
                categories = (
                    db.query(Category).filter(Category.id.in_(category_ids)).all()
                )
                for cat in categories:
                    solution.category_associations.append(
                        SolutionCategoryAssociation(category=cat)
                    )

    if "documents" in update_data:
        documents = update_data.pop("documents")
        if documents is not None:
            solution.documents.clear()
            for doc in documents:
                solution.documents.append(SolutionDocument(**doc))

    if "videos" in update_data:
        videos = update_data.pop("videos")
        if videos is not None:
            solution.videos.clear()
            for vid in videos:
                solution.videos.append(SolutionVideo(**vid))

    if "service_urls" in update_data:
        service_urls = update_data.pop("service_urls")
        if service_urls is not None:
            solution.service_urls.clear()
            for s_url in service_urls:
                solution.service_urls.append(SolutionServiceUrl(**s_url))

    for field, value in update_data.items():
        setattr(solution, field, value)

    db.commit()
    db.refresh(solution)

    return get_solution_by_id(db, solution.id) or solution


def delete_solution(db: Session, solution: Solution) -> None:
    db.delete(solution)
    db.commit()
