from uuid import UUID
from pydantic import BaseModel


class CategoryDistributionItem(BaseModel):
    id: UUID
    name: str
    total: int
    recent: int


class DashboardTotals(BaseModel):
    solutions: int
    categories: int
    recent: int


class DashboardStatsResponse(BaseModel):
    totals: DashboardTotals
    categories_distribution: list[CategoryDistributionItem]
