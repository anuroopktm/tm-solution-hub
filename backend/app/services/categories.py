from uuid import UUID

from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_categories(db: Session) -> list[Category]:
    return db.query(Category).order_by(Category.name.asc()).all()


def get_category_by_id(db: Session, category_id: UUID) -> Category | None:
    return db.query(Category).filter(Category.id == category_id).first()


def get_category_by_name(
    db: Session, name: str, exclude_id: UUID | None = None
) -> Category | None:
    query = db.query(Category).filter(Category.name == name)

    if exclude_id is not None:
        query = query.filter(Category.id != exclude_id)

    return query.first()


def create_category(db: Session, payload: CategoryCreate) -> Category:
    category = Category(**payload.model_dump())

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


def update_category(
    db: Session, category: Category, payload: CategoryUpdate
) -> Category:
    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)

    return category


def delete_category(db: Session, category: Category) -> None:
    db.delete(category)
    db.commit()
