# pyright: reportUnknownMemberType=false
"""Automated test suite verifying LangGraph tools, graph compilation, and persistence."""

import asyncio
from pathlib import Path
import sys
from typing import Any, cast
from unittest.mock import AsyncMock, patch

# Ensure backend root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.runnables.config import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver

from app.chat.graph import AgentState, build_chat_graph
from app.chat.tools import ALL_TOOLS
from app.chat.tools.analytics import compare_solutions, get_hub_metrics
from app.chat.tools.categories import get_solutions_by_category, list_categories
from app.chat.tools.solutions import (
    filter_solutions_by_tech,
    get_solution_details,
    list_recent_solutions,
    search_solutions,
)


def run_tool_tests() -> None:
    print("=" * 60)
    print("RUNNING IN-PROCESS LANGCHAIN TOOLS TEST SUITE")
    print("=" * 60)

    # 1. Total tools count
    print(f"\n[1] Verifying registered tools... Found {len(ALL_TOOLS)} tools.")
    assert len(ALL_TOOLS) == 8, f"Expected 8 tools, got {len(ALL_TOOLS)}"
    for t in ALL_TOOLS:
        print(f"  ✓ Tool '{t.name}' (params: {list(t.args.keys())})")

    # 2. Tool invocations and parameter schema assertions
    print("\n[2] Testing tool parameter schemas...")
    assert "query" in search_solutions.args
    assert "identifier" in get_solution_details.args
    assert "limit" in list_recent_solutions.args
    assert "technologies" in filter_solutions_by_tech.args
    assert "category_name_or_id" in get_solutions_by_category.args
    assert "solution_identifiers" in compare_solutions.args
    assert list_categories.name == "list_categories"
    assert get_hub_metrics.name == "get_hub_metrics"
    print("  ✓ All tool argument schemas validated successfully!")


async def run_graph_tests() -> None:
    print("\n" + "=" * 60)
    print("RUNNING LANGGRAPH AGENT GRAPH & PERSISTENCE TEST SUITE")
    print("=" * 60)

    # 1. Graph Compilation
    print("\n[1] Testing graph compilation with checkpointer...")
    memory = MemorySaver()
    graph = build_chat_graph(checkpointer=memory)
    assert "agent" in graph.nodes
    assert "tools" in graph.nodes
    print("  ✓ Graph compiled with nodes:", list(graph.nodes.keys()))

    # 2. Multi-turn State Persistence
    print("\n[2] Testing multi-turn thread persistence...")
    thread_id = "test-thread-42"
    config: RunnableConfig = {"configurable": {"thread_id": thread_id}}

    mock_assistant_turn_1 = AIMessage(
        content="I can help you explore solutions in TM Solution Hub."
    )
    mock_assistant_turn_2 = AIMessage(
        content="Document Intelligence Platform uses FastAPI and Docker."
    )

    with patch("app.chat.graph.get_model") as mock_get_model:
        mock_model = AsyncMock()
        mock_get_model.return_value = mock_model

        # Turn 1
        mock_model.ainvoke.return_value = mock_assistant_turn_1
        turn_1_input: AgentState = {
            "messages": [HumanMessage(content="Hello! What can you do?")]
        }
        await graph.ainvoke(
            turn_1_input, config=config
        )  # pyright: ignore[reportUnknownMemberType]

        state_1 = await graph.aget_state(config)
        turn_1_count = len(state_1.values["messages"])
        print(f"  ✓ Turn 1 completed. Messages in thread: {turn_1_count}")
        assert turn_1_count >= 2, "Expected at least user + assistant messages"

        # Turn 2
        mock_model.ainvoke.return_value = mock_assistant_turn_2
        turn_2_input: AgentState = {
            "messages": [HumanMessage(content="Tell me about Document Intelligence")]
        }
        await graph.ainvoke(
            turn_2_input, config=config
        )  # pyright: ignore[reportUnknownMemberType]

        state_2 = await graph.aget_state(config)
        turn_2_count = len(state_2.values["messages"])
        print(f"  ✓ Turn 2 completed. Messages in thread: {turn_2_count}")
        assert turn_2_count > turn_1_count, "Expected history to be preserved"

    # 3. Streaming Event Emission
    print("\n[3] Testing astream_events streaming engine...")
    events_collected: list[str] = []
    with patch("app.chat.graph.get_model") as mock_get_model:
        mock_model = AsyncMock()
        mock_model.ainvoke.return_value = AIMessage(content="Stream test content.")
        mock_get_model.return_value = mock_model

        stream_input: AgentState = {
            "messages": [HumanMessage(content="Streaming check")]
        }
        stream_config: RunnableConfig = {
            "configurable": {"thread_id": "test-stream-thread"}
        }

        async for (
            ev
        ) in graph.astream_events(  # pyright: ignore[reportUnknownMemberType]
            stream_input,
            config=stream_config,
            version="v2",
        ):
            event_name = cast(dict[str, Any], ev).get("event")
            if isinstance(event_name, str):
                events_collected.append(event_name)

    print(f"  ✓ Collected {len(events_collected)} graph events during stream.")
    print("  ✓ Sample events:", events_collected[:5])

    print("\n" + "=" * 60)
    print("ALL LANGGRAPH INTEGRATION TESTS PASSED SUCCESSFULLY! ")
    print("=" * 60)


def main() -> None:
    run_tool_tests()
    asyncio.run(run_graph_tests())


if __name__ == "__main__":
    main()
