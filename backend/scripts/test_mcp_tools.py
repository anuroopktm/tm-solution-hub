"""Automated test suite verifying FastMCP tools and HTTP endpoint integration."""

from pathlib import Path
import sys
from typing import Any

# Ensure project root is in sys.path when script is executed directly
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient

from app.main import app
from app.mcp.tools.analytics import compare_solutions, get_hub_metrics
from app.mcp.tools.categories import get_solutions_by_category, list_categories
from app.mcp.tools.solutions import (
    filter_solutions_by_tech,
    get_solution_details,
    list_recent_solutions,
    search_solutions,
)


def run_tests() -> None:
    print("=" * 60)
    print("RUNNING MCP TOOLS INTEGRATION TEST SUITE")
    print("=" * 60)

    # 1. Search Solutions
    print("\n[1] Testing search_solutions(query='Document')...")
    res1 = search_solutions(query="Document")
    assert res1["total_matches"] >= 1, f"Expected matches, got {res1}"
    print(
        f"  -> Found {res1['total_matches']} match(es): {[s['title'] for s in res1['solutions']]}"
    )

    # 2. Get Solution Details
    print("\n[2] Testing get_solution_details...")
    first_title = res1["solutions"][0]["title"]
    res3 = get_solution_details(identifier=first_title)
    assert res3["found"] is True, f"{first_title} should be found"
    sol = res3["solution"]
    assert len(sol["documents"]) >= 2, "Expected 2 documents"
    assert len(sol["videos"]) >= 1, "Expected 1 video"
    assert len(sol["service_urls"]) >= 2, "Expected 2 service URLs"
    print(f"  -> Retrieved: {sol['title']}")
    print(f"  -> Documents: {[d['name'] for d in sol['documents']]}")
    print(f"  -> Service URLs: {[u['service_name'] for u in sol['service_urls']]}")

    # 3. List Recent Solutions
    print("\n[3] Testing list_recent_solutions(limit=3)...")
    res4 = list_recent_solutions(limit=3)
    assert res4["count"] >= 3, "Expected at least 3 solutions"
    print(f"  -> Retrieved {res4['count']} recent solutions")

    # 4. Filter Solutions by Tech Stack
    print("\n[4] Testing filter_solutions_by_tech(technologies=['Kafka', 'Docker'])...")
    res5 = filter_solutions_by_tech(technologies=["Kafka", "Docker"])
    assert res5["total_matches"] >= 1, "Expected at least 1 match"
    print(
        f"  -> Found {res5['total_matches']} solutions using Kafka or Docker: {[s['title'] for s in res5['solutions']]}"
    )

    # 5. List Categories
    print("\n[5] Testing list_categories()...")
    res6 = list_categories()
    assert res6["total_categories"] >= 10, "Expected at least 10 categories"
    categories_with_solutions = [
        c for c in res6["categories"] if c["solutions_count"] > 0
    ]
    print(f"  -> Total categories: {res6['total_categories']}")
    cats_summary = [
        f"{c['name']} ({c['solutions_count']})" for c in categories_with_solutions
    ]
    print(f"  -> Categories with solutions: {cats_summary}")

    # 6. Get Solutions by Category
    print("\n[6] Testing get_solutions_by_category('Finance and Accounting')...")
    res7 = get_solutions_by_category("Finance and Accounting")
    assert res7["found"] is True, "Category should be found"
    assert res7["total_solutions"] >= 2, "Expected at least 2 solutions"
    print(
        f"  -> Solutions under {res7['category']['name']}: {[s['title'] for s in res7['solutions']]}"
    )

    # 7. Compare Solutions
    print("\n[7] Testing compare_solutions...")
    res8 = compare_solutions(
        [
            "Agentic Document Intelligence Platform",
            "Real-Time Payment Fraud Shield",
        ]
    )
    assert res8["compared_count"] == 2, "Expected 2 compared"
    shared = res8["tech_stack_analysis"]["shared_technologies"]
    print(f"  -> Shared technologies between solutions: {shared}")

    # 8. Get Hub Metrics
    print("\n[8] Testing get_hub_metrics()...")
    res9 = get_hub_metrics()
    assert res9["total_solutions"] >= 3, "Expected at least 3 total solutions"
    print(f"  -> Total Solutions: {res9['total_solutions']}")
    top_tech_summary = [
        f"{t['technology']} ({t['count']})" for t in res9["top_technologies"][:5]
    ]
    print(f"  -> Top Technologies: {top_tech_summary}")

    # 10. Test FastAPI Mounted /mcp HTTP Endpoint
    print("\n[10] Testing FastAPI /mcp mounted endpoint via HTTP client...")
    with TestClient(app) as client:
        # Initialize handshake
        init_payload: dict[str, Any] = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "test-client", "version": "1.0"},
            },
        }
        resp = client.post(
            "/mcp",
            json=init_payload,
            headers={"Accept": "application/json, text/event-stream"},
        )
        assert resp.status_code == 200, f"Failed to initialize MCP: {resp.status_code}"
        print("  -> /mcp HTTP initialize handshake successful (HTTP 200)!")

    print("\n" + "=" * 60)
    print("ALL 10 MCP TESTS PASSED SUCCESSFULLY! ")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
