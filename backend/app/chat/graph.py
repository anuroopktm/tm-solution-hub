# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false
"""LangGraph agent workflow for TM Solution Hub."""

from typing import Annotated, Any, Literal
from typing_extensions import TypedDict

from langchain_core.messages import AnyMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from pydantic import SecretStr

from app.chat.tools import ALL_TOOLS
from app.core.config import settings

SYSTEM_PROMPT = f"""You are the {settings.BRAND_NAME} Solutions Hub AI Assistant, an expert technical architect and enterprise solutions advisor.
Your primary role is to help users discover, understand, and evaluate software solutions, technical architectures, reusable accelerators, tech stacks, and domain categories in {settings.BRAND_NAME} Solutions Hub.

Guidelines:
1. When answering questions regarding solutions, technologies, or categories, ALWAYS consult your available tools (search_solutions, get_solution_details, compare_solutions, filter_solutions_by_tech, list_categories, get_solutions_by_category, get_hub_metrics, list_recent_solutions).
2. Cite concrete solution titles, descriptions, and technical architectures when available.
3. If no solutions match a specific criteria, explain clearly and suggest alternative search terms or categories.
4. Format your responses with structured Markdown, including headings, concise bullet points, and code snippets when helpful.
5. Do not invent or assume solutions or documentation links that were not returned by your tools.
6. NEVER dump raw JSON, raw dictionary output, or unformatted tool results in your response. Always synthesize findings into clean, conversational Markdown.
7. Keep responses concise, focused, and directly addressing the user's intent to conserve context and ensure quick evaluation.
"""


class AgentState(TypedDict):
    """Conversation state passed between graph nodes."""

    messages: Annotated[list[AnyMessage], add_messages]


def prepare_messages_for_llm(
    messages: list[AnyMessage], max_history: int = 8
) -> list[AnyMessage]:
    """Prune and prepare messages for the LLM to prevent TPM/token rate limit errors.

    1. Keeps SystemMessage at index 0.
    2. Keeps recent conversation window (up to last max_history messages).
    3. Prunes stale ToolMessage content from prior turns to save tokens.
    4. Ensures tool calls and tool messages remain properly paired.
    """
    if not messages:
        return [SystemMessage(content=SYSTEM_PROMPT)]

    # Filter out any existing SystemMessage
    non_sys = [m for m in messages if not isinstance(m, SystemMessage)]

    # Window to at most max_history messages
    if len(non_sys) > max_history:
        start_idx = len(non_sys) - max_history
        # Ensure we don't start on an orphaned ToolMessage without its preceding AIMessage
        while start_idx < len(non_sys) and isinstance(non_sys[start_idx], ToolMessage):
            start_idx += 1
        non_sys = non_sys[start_idx:]

    # Identify last HumanMessage index in the active window
    last_human_idx = -1
    for i in range(len(non_sys) - 1, -1, -1):
        if isinstance(non_sys[i], HumanMessage):
            last_human_idx = i
            break

    # Prune old ToolMessages prior to the last human message to save thousands of tokens
    prepared: list[AnyMessage] = []
    for i, m in enumerate(non_sys):
        if isinstance(m, ToolMessage) and i < last_human_idx:
            prepared.append(
                ToolMessage(
                    content="[Prior tool query results processed]",
                    tool_call_id=m.tool_call_id,
                    name=getattr(m, "name", None),
                )
            )
        else:
            prepared.append(m)

    return [SystemMessage(content=SYSTEM_PROMPT)] + prepared


def get_model():
    """Return configured Chat model (OpenAI or Groq) with tools bound."""
    if settings.LLM_PROVIDER == "openai":
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured in settings")
        llm = ChatOpenAI(
            model=settings.OPENAI_MODEL or "gpt-4o",
            api_key=SecretStr(settings.OPENAI_API_KEY),
            temperature=0.2,
            max_tokens=2048,
            streaming=True,
        )
    else:
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not configured in settings")
        llm = ChatGroq(
            model=settings.GROQ_MODEL or "openai/gpt-oss-120b",
            api_key=SecretStr(settings.GROQ_API_KEY),
            temperature=0.2,
            max_tokens=2048,
            reasoning_format="parsed",
            streaming=True,
        )

    return llm.bind_tools(ALL_TOOLS)


async def call_model(state: AgentState) -> dict[str, Any]:
    """Invoke the language model with pruned, token-efficient conversation history."""
    messages = prepare_messages_for_llm(list(state["messages"]))
    model = get_model()
    response = await model.ainvoke(messages)
    return {"messages": [response]}


def should_continue(state: AgentState) -> Literal["tools", "__end__"]:
    """Determine whether to route to tool execution or conclude the turn."""
    last_message = state["messages"][-1]
    if getattr(last_message, "tool_calls", None):
        return "tools"
    return "__end__"


def build_chat_graph(checkpointer: BaseCheckpointSaver[Any] | None = None):
    """Assemble and compile the LangGraph ReAct agent workflow.

    Flow:
        START -> agent -> (should_continue)
                           ├── has tool calls -> tools -> agent
                           └── no tool calls  -> END
    """
    workflow = StateGraph(AgentState)

    # 1. Define nodes
    workflow.add_node("agent", call_model)
    workflow.add_node("tools", ToolNode(ALL_TOOLS))

    # 2. Define edges
    workflow.add_edge(START, "agent")
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            "__end__": END,
        },
    )
    workflow.add_edge("tools", "agent")

    # 3. Compile graph with checkpointer persistence
    return workflow.compile(checkpointer=checkpointer)
