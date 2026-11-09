from uuid import UUID

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


def get_solutions(db: Session) -> list[Solution]:
    return (
        db.query(Solution)
        .options(joinedload(Solution.lead))
        .order_by(Solution.created_at.desc())
        .all()
    )


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


def get_solution_by_code(
    db: Session, code: str, exclude_id: UUID | None = None
) -> Solution | None:
    query = db.query(Solution).filter(Solution.code == code)

    if exclude_id is not None:
        query = query.filter(Solution.id != exclude_id)

    return query.first()


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
