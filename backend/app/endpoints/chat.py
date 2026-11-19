# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false
from collections.abc import AsyncIterator
import json
import logging
from typing import Any, cast
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from langchain_core.runnables.config import RunnableConfig
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.chat.graph import AgentState, build_chat_graph
from app.core.database import SessionLocal, get_db
from app.models.user import User
from app.schemas.conversation import ChatStreamRequest
from app.services import conversation as conversation_service

logger = logging.getLogger(__name__)

router = APIRouter()


def _format_sse(event: str, data: dict[str, object] | str) -> str:
    """Format an event string and data payload as Server-Sent Event (SSE)."""
    payload_str = json.dumps(data) if isinstance(data, dict) else data
    return f"event: {event}\ndata: {payload_str}\n\n"


@router.post("/stream")
async def chat_stream(
    payload: ChatStreamRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a user message and stream the orchestrated assistant response via Server-Sent Events (SSE).

    Flow:
    1. Authenticate user via JWT.
    2. Validate conversation ownership or create a new conversation.
    3. Persist the user message to the database immediately.
    4. Stream the LangGraph execution token-by-token and tool calls using SSE.
    5. Persist the final assistant response to the relational database upon completion.
    """
    conversation_id = payload.conversation_id

    # 1. Validate ownership or create conversation
    if conversation_id:
        conversation = conversation_service.get_conversation(
            db=db,
            user_id=current_user.id,
            conversation_id=conversation_id,
        )
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )
    else:
        # Create a new conversation with a title derived from the initial prompt
        clean_title = (
            payload.message[:40] + "..."
            if len(payload.message) > 40
            else payload.message
        )
        conversation = conversation_service.create_conversation(
            db=db,
            user_id=current_user.id,
            title=clean_title,
        )
        conversation_id = conversation.id

    # 2. Persist user message to the database immediately
    user_msg = conversation_service.add_message(
        db=db,
        conversation_id=conversation_id,
        role="user",
        content=payload.message,
    )

    conv_id: UUID = conversation_id
    user_msg_id: UUID = user_msg.id
    conv_title: str = conversation.title

    # Retrieve compiled agent from app state or fallback
    agent = getattr(request.app.state, "agent", None)
    if agent is None:
        agent = build_chat_graph()

    async def event_generator() -> AsyncIterator[str]:
        # Emit initial metadata event
        yield _format_sse(
            "metadata",
            {
                "conversation_id": str(conv_id),
                "title": conv_title,
                "user_message_id": str(user_msg_id),
            },
        )

        full_response = ""
        config: RunnableConfig = {
            "configurable": {
                "thread_id": str(conv_id),
                "user_id": str(current_user.id),
            }
        }
        input_data: AgentState = {"messages": [HumanMessage(content=payload.message)]}

        try:
            async for event in agent.astream_events(
                input_data, config=config, version="v2"
            ):
                event_dict = cast(dict[str, Any], event)
                kind = event_dict.get("event")

                # Streaming token chunks from LLM
                if kind == "on_chat_model_stream":
                    chunk = event_dict.get("data", {}).get("chunk")
                    chunk_content = getattr(chunk, "content", None)
                    if isinstance(chunk_content, str) and chunk_content:
                        full_response += chunk_content
                        yield _format_sse("content", {"chunk": chunk_content})

                # Streaming tool call triggers
                elif kind == "on_tool_start":
                    tool_name = event_dict.get("name", "")
                    tool_input = event_dict.get("data", {}).get("input")
                    run_id = event_dict.get("run_id", "")
                    yield _format_sse(
                        "tool_call",
                        {
                            "tool_id": str(run_id),
                            "name": tool_name,
                            "arguments": tool_input,
                        },
                    )

                # Streaming tool execution results
                elif kind == "on_tool_end":
                    tool_name = event_dict.get("name", "")
                    tool_output = event_dict.get("data", {}).get("output")
                    run_id = event_dict.get("run_id", "")
                    output_content = getattr(tool_output, "content", tool_output)
                    yield _format_sse(
                        "tool_result",
                        {
                            "tool_id": str(run_id),
                            "name": tool_name,
                            "result": output_content,
                        },
                    )

        except Exception as exc:
            logger.exception("Streaming error during LangGraph execution: %s", exc)
            yield _format_sse("error", {"message": f"Stream error: {exc}"})

        # 3. Persist assistant message to DB upon completion
        if full_response.strip():
            save_db = SessionLocal()
            try:
                conversation_service.add_message(
                    db=save_db,
                    conversation_id=conv_id,
                    role="assistant",
                    content=full_response,
                )
            except Exception as exc:
                logger.error("Failed to save assistant message to DB: %s", exc)
            finally:
                save_db.close()

        # Emit terminal done event
        yield _format_sse("done", {"full_response": full_response})

    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers=headers,
    )
