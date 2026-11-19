"""Registered LangChain tools for TM Solution Hub."""

from langchain_core.tools import BaseTool

from app.chat.tools.analytics import compare_solutions, get_hub_metrics
from app.chat.tools.categories import get_solutions_by_category, list_categories
from app.chat.tools.solutions import (
    filter_solutions_by_tech,
    get_solution_details,
    list_recent_solutions,
    search_solutions,
)

ALL_TOOLS: list[BaseTool] = [
    search_solutions,
    get_solution_details,
    list_recent_solutions,
    filter_solutions_by_tech,
    list_categories,
    get_solutions_by_category,
    compare_solutions,
    get_hub_metrics,
]

__all__ = [
    "ALL_TOOLS",
    "search_solutions",
    "get_solution_details",
    "list_recent_solutions",
    "filter_solutions_by_tech",
    "list_categories",
    "get_solutions_by_category",
    "compare_solutions",
    "get_hub_metrics",
]
