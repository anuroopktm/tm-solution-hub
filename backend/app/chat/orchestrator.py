from collections.abc import AsyncIterator
from dataclasses import dataclass
import logging
from typing import Any, Literal

from app.chat.mcp_adapter import MCPAdapter
from app.chat.providers.base import BaseLLMProvider, Message
from app.chat.providers.factory import get_llm_provider

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the ThoughtMinds (TM) Solution Hub AI Assistant, an expert technical architect and enterprise solutions advisor.
Your primary role is to help users discover, understand, and evaluate software solutions, technical architectures, reusable accelerators, tech stacks, and domain categories in TM Solution Hub.

Guidelines:
1. When answering questions regarding solutions, technologies, or categories, ALWAYS consult your available tools (search_solutions, get_solution_details, compare_solutions, filter_solutions_by_tech, list_categories, get_solutions_by_category, get_hub_metrics, list_recent_solutions).
2. Cite concrete solution titles, descriptions, and technical architectures when available.
3. If no solutions match a specific criteria, explain clearly and suggest alternative search terms or categories.
4. Format your responses with structured Markdown, including headings, concise bullet points, and code snippets when helpful.
5. Do not invent or assume solutions or documentation links that were not returned by your tools.
"""


@dataclass
class ChatEvent:
    type: Literal["content", "tool_call", "tool_result", "error", "done"]
    data: dict[str, Any] | str


class ChatOrchestrator:
    """Coordinates conversation context, LLM invocations, and FastMCP tool execution."""

    def __init__(
        self,
        provider: BaseLLMProvider | None = None,
        mcp_adapter: MCPAdapter | None = None,
    ):
        self.provider = provider or get_llm_provider()
        self.mcp_adapter = mcp_adapter or MCPAdapter()

    def build_messages(
        self,
        history: list[dict[str, str]],
        user_prompt: str,
    ) -> list[Message]:
        """Construct a complete message sequence with system prompt, history, and user prompt."""
        messages: list[Message] = [
            {"role": "system", "content": SYSTEM_PROMPT},
        ]

        for msg in history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ("user", "assistant", "system"):
                messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": user_prompt})
        return messages

    async def stream_chat(
        self,
        history: list[dict[str, str]],
        user_prompt: str,
        max_tool_iterations: int = 5,
    ) -> AsyncIterator[ChatEvent]:
        """Execute the agentic chat loop, executing MCP tools and streaming output tokens."""
        messages = self.build_messages(history, user_prompt)
        tools = await self.mcp_adapter.get_openai_tools()
        tools_executed = False
        full_response = ""

        try:
            for _ in range(max_tool_iterations):
                # Request response from LLM with tool definitions
                response = await self.provider.generate(messages, tools=tools)

                if not response.choices:
                    yield ChatEvent(
                        type="error", data={"message": "No choices returned by LLM"}
                    )
                    return

                choice = response.choices[0]
                message = choice.message
                tool_calls = getattr(message, "tool_calls", None)

                # Case A: LLM decided to execute one or more tools
                if tool_calls:
                    tools_executed = True

                    # Append assistant's tool-call request to message context
                    assistant_msg: Message = {
                        "role": "assistant",
                        "content": message.content or "",
                        "tool_calls": [
                            {
                                "id": tc.id,
                                "type": "function",
                                "function": {
                                    "name": tc.function.name,
                                    "arguments": tc.function.arguments,
                                },
                            }
                            for tc in tool_calls
                        ],
                    }
                    messages.append(assistant_msg)

                    for tc in tool_calls:
                        tool_name = tc.function.name
                        tool_args = tc.function.arguments

                        yield ChatEvent(
                            type="tool_call",
                            data={
                                "tool_id": tc.id,
                                "name": tool_name,
                                "arguments": tool_args,
                            },
                        )

                        # Execute tool via FastMCP adapter
                        tool_result = await self.mcp_adapter.call_tool(
                            tool_name, tool_args
                        )

                        yield ChatEvent(
                            type="tool_result",
                            data={
                                "tool_id": tc.id,
                                "name": tool_name,
                                "result": tool_result,
                            },
                        )

                        # Append tool output to message context
                        messages.append(
                            {
                                "role": "tool",
                                "tool_call_id": tc.id,
                                "name": tool_name,
                                "content": tool_result,
                            }
                        )

                    # Continue loop to allow LLM to interpret tool results
                    continue

                # Case B: LLM formulated final text without tool calls
                if tools_executed:
                    # Stream synthesized final answer using provider.stream
                    async for chunk in self.provider.stream(messages):
                        full_response += chunk
                        yield ChatEvent(type="content", data=chunk)
                else:
                    # No tools were invoked; use content generated in first turn
                    content = message.content or ""
                    full_response = content
                    yield ChatEvent(type="content", data=content)

                break
            else:
                # If tool loop limit reached, stream a conclusion
                fallback = "\n[Tool execution limit reached. Concluding response.]"
                full_response += fallback
                yield ChatEvent(type="content", data=fallback)

            yield ChatEvent(
                type="done",
                data={"full_response": full_response},
            )

        except Exception as exc:
            logger.exception("Error during chat orchestration: %s", exc)
            yield ChatEvent(
                type="error",
                data={"message": f"Orchestrator error: {exc}"},
            )
