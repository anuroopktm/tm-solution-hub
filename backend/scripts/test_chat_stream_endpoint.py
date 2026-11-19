# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false
"""Integration test for FastAPI /api/chat/stream Server-Sent Events (SSE) endpoint."""

import asyncio
from pathlib import Path
import sys
from unittest.mock import AsyncMock, MagicMock, patch
import uuid

# Ensure backend root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import ASGITransport, AsyncClient
from langchain_core.messages import AIMessage, AIMessageChunk
from langgraph.checkpoint.memory import MemorySaver

from app.api.deps import get_current_user
from app.chat.graph import build_chat_graph
from app.core.database import get_db
from app.main import app
from app.models.conversation import Conversation, Message
from app.models.user import User


class MockUser:
    id = uuid.uuid4()
    email = "test@thoughtminds.ai"
    username = "testuser"
    is_active = True


def create_mock_db():
    mock_db = MagicMock()
    mock_conv = MagicMock(spec=Conversation)
    mock_conv.id = uuid.uuid4()
    mock_conv.title = "Test Conversation"
    mock_conv.user_id = MockUser.id

    mock_msg = MagicMock(spec=Message)
    mock_msg.id = uuid.uuid4()
    mock_msg.role = "user"
    mock_msg.content = "Hello!"

    mock_db.query.return_value.filter.return_value.first.return_value = mock_conv
    return mock_db, mock_conv, mock_msg


async def test_stream_endpoint():
    print("=" * 60)
    print("TESTING FASTAPI /api/chat/stream SSE ENDPOINT")
    print("=" * 60)

    mock_user = MockUser()
    mock_db, mock_conv, mock_msg = create_mock_db()

    # Override FastAPI dependencies
    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[get_db] = lambda: mock_db

    # Initialize graph with MemorySaver on app.state
    memory = MemorySaver()
    app.state.checkpointer = memory
    app.state.agent = build_chat_graph(checkpointer=memory)

    # 1. Test initial message (creates new conversation)
    print("\n[1] Testing initial conversation stream (new session)...")
    payload = {"message": "Hello, tell me about Solution Hub"}

    # Mock the LLM to yield chunks
    with patch("app.chat.graph.get_model") as mock_get_model:
        mock_model = AsyncMock()
        mock_model.ainvoke.return_value = AIMessage(
            content="TM Solution Hub is an enterprise catalog for software solutions."
        )
        mock_get_model.return_value = mock_model

        # Mock conversation service methods
        with patch(
            "app.services.conversation.create_conversation", return_value=mock_conv
        ), patch("app.services.conversation.add_message", return_value=mock_msg):

            transport = ASGITransport(app=app)
            async with AsyncClient(
                transport=transport, base_url="http://test"
            ) as client:
                response = await client.post(
                    "/api/chat/stream",
                    json=payload,
                    headers={"Accept": "text/event-stream"},
                )

                assert (
                    response.status_code == 200
                ), f"Expected 200 OK, got {response.status_code}"
                assert "text/event-stream" in response.headers["content-type"]
                print(f"  ✓ HTTP Status: {response.status_code}")
                print(f"  ✓ Content-Type: {response.headers['content-type']}")

                # Parse SSE events from response
                body_text = response.text
                print(f"  ✓ Raw SSE stream length: {len(body_text)} bytes")

                lines = body_text.strip().split("\n")
                events = [line for line in lines if line.startswith("event: ")]
                print(f"  ✓ Emitted SSE events: {events}")

                assert any("metadata" in e for e in events), "Expected 'metadata' event"
                assert any("done" in e for e in events), "Expected 'done' event"

    # 2. Test multi-turn follow-up message with existing conversation_id
    print("\n[2] Testing follow-up stream with conversation_id...")
    follow_up_payload = {
        "conversation_id": str(mock_conv.id),
        "message": "What technologies are used?",
    }

    with patch("app.chat.graph.get_model") as mock_get_model:
        mock_model = AsyncMock()
        mock_model.ainvoke.return_value = AIMessage(
            content="It uses FastAPI, React, and LangGraph."
        )
        mock_get_model.return_value = mock_model

        with patch(
            "app.services.conversation.get_conversation", return_value=mock_conv
        ), patch("app.services.conversation.add_message", return_value=mock_msg):

            transport = ASGITransport(app=app)
            async with AsyncClient(
                transport=transport, base_url="http://test"
            ) as client:
                response = await client.post(
                    "/api/chat/stream",
                    json=follow_up_payload,
                    headers={"Accept": "text/event-stream"},
                )

                assert response.status_code == 200
                print(f"  ✓ Follow-up HTTP Status: {response.status_code}")
                assert "metadata" in response.text
                assert "done" in response.text
                print("  ✓ Follow-up SSE stream completed successfully!")

    # 3. Test detailed SSE event emission (content streaming, tool_call, tool_result)
    print("\n[3] Testing SSE token chunks and tool call event emission...")
    mock_agent = AsyncMock()

    async def fake_astream_events(input_data, config, version):
        yield {
            "event": "on_tool_start",
            "name": "search_solutions",
            "data": {"input": {"query": "AI"}},
            "run_id": "tool-run-1",
        }
        yield {
            "event": "on_tool_end",
            "name": "search_solutions",
            "data": {
                "output": {
                    "total_matches": 1,
                    "solutions": [{"title": "Agentic Platform"}],
                }
            },
            "run_id": "tool-run-1",
        }
        yield {
            "event": "on_chat_model_stream",
            "data": {"chunk": AIMessageChunk(content="Found ")},
        }
        yield {
            "event": "on_chat_model_stream",
            "data": {
                "chunk": AIMessageChunk(
                    content="1 matching solution: Agentic Platform."
                )
            },
        }

    mock_agent.astream_events = fake_astream_events
    app.state.agent = mock_agent

    with patch(
        "app.services.conversation.create_conversation", return_value=mock_conv
    ), patch("app.services.conversation.add_message", return_value=mock_msg):

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={"message": "Find AI solutions"},
                headers={"Accept": "text/event-stream"},
            )

            assert response.status_code == 200
            body = response.text
            print("  ✓ SSE Body Received:")
            for line in body.strip().split("\n"):
                if line.startswith("event: "):
                    print(f"    -> {line}")

            assert "event: metadata" in body
            assert "event: tool_call" in body
            assert "event: tool_result" in body
            assert "event: content" in body
            assert "event: done" in body
            assert "Agentic Platform" in body
            print(
                "  ✓ All SSE events (metadata, tool_call, tool_result, content, done) verified!"
            )

    # 4. Clean up overrides
    app.dependency_overrides.clear()

    print("\n" + "=" * 60)
    print("ALL /api/chat/stream ENDPOINT TESTS PASSED SUCCESSFULLY! ")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_stream_endpoint())
