from collections.abc import AsyncIterator
import json
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.chat.orchestrator import ChatOrchestrator
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a user message and stream the orchestrated assistant response via Server-Sent Events (SSE).

    Flow:
    1. Authenticate user via JWT.
    2. Validate conversation ownership or create a new conversation.
    3. Persist the user message to the database immediately.
    4. Retrieve prior conversation history.
    5. Stream the response token-by-token and tool calls using SSE.
    6. Persist the final assistant response to the database.
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

    # 2. Retrieve history prior to adding current message
    existing_messages = (
        conversation_service.get_conversation_messages(
            db=db,
            user_id=current_user.id,
            conversation_id=conversation_id,
        )
        or []
    )

    history: list[dict[str, str]] = [
        {"role": msg.role, "content": msg.content} for msg in existing_messages
    ]

    # 3. Persist user message to the database immediately
    user_msg = conversation_service.add_message(
        db=db,
        conversation_id=conversation_id,
        role="user",
        content=payload.message,
    )

    conv_id: UUID = conversation_id
    user_msg_id: UUID = user_msg.id
    conv_title: str = conversation.title

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

        orchestrator = ChatOrchestrator()
        full_response = ""

        try:
            async for event in orchestrator.stream_chat(history, payload.message):
                if event.type == "content":
                    chunk_text = event.data if isinstance(event.data, str) else ""
                    full_response += chunk_text
                    yield _format_sse("content", {"chunk": chunk_text})

                elif event.type == "tool_call":
                    yield _format_sse(
                        "tool_call",
                        (
                            event.data
                            if isinstance(event.data, dict)
                            else {"data": event.data}
                        ),
                    )

                elif event.type == "tool_result":
                    yield _format_sse(
                        "tool_result",
                        (
                            event.data
                            if isinstance(event.data, dict)
                            else {"data": event.data}
                        ),
                    )

                elif event.type == "error":
                    yield _format_sse(
                        "error",
                        (
                            event.data
                            if isinstance(event.data, dict)
                            else {"message": str(event.data)}
                        ),
                    )

                elif event.type == "done":
                    if isinstance(event.data, dict) and "full_response" in event.data:
                        full_response = str(event.data["full_response"])
                    break

        except Exception as exc:
            logger.exception("Streaming error: %s", exc)
            yield _format_sse("error", {"message": f"Stream error: {exc}"})

        # 4. Persist assistant message to DB upon completion
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
