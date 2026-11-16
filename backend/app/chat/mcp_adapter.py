from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
import json
import logging
from typing import Any, cast

from fastmcp import Client
from mcp.types import TextContent

from app.core.config import settings
from app.mcp.server import mcp

logger = logging.getLogger(__name__)


class MCPAdapter:
    """Adapter bridging FastMCP server tools and OpenAI-compatible LLM tool definitions.

    Connects to a remote FastMCP server container (e.g. http://mcp-server:8001) via HTTP transport,
    with an automatic fallback to the local FastMCP instance for standalone or local test environments.
    """

    def __init__(self, server_url: str | None = None):
        self.server_url = server_url or settings.MCP_SERVER_URL
        self._cached_openai_tools: list[dict[str, Any]] | None = None

    @asynccontextmanager
    async def _get_client(self) -> AsyncGenerator[Client[Any], None]:
        """Provide a connected FastMCP Client, targeting the remote server if configured or falling back to local."""
        if self.server_url:
            try:
                remote_client: Client[Any] = Client(self.server_url)
                async with remote_client:
                    yield remote_client
                    return
            except Exception as exc:
                logger.warning(
                    "Failed to connect to remote MCP server at '%s': %s. Falling back to local server.",
                    self.server_url,
                    exc,
                )

        local_client: Client[Any] = Client(mcp)
        async with local_client:
            yield local_client

    async def get_openai_tools(self, refresh: bool = False) -> list[dict[str, Any]]:
        """Retrieve all registered FastMCP tools converted to OpenAI function format.

        Returns:
            list of dicts conforming to OpenAI `tools` schema:
            [{"type": "function", "function": {"name": ..., "description": ..., "parameters": ...}}]
        """
        if self._cached_openai_tools is not None and not refresh:
            return self._cached_openai_tools

        try:
            async with self._get_client() as client:
                mcp_tools = await client.list_tools()
                openai_tools: list[dict[str, Any]] = []

                default_params: dict[str, Any] = {
                    "type": "object",
                    "properties": cast(dict[str, Any], {}),
                }

                for tool in mcp_tools:
                    raw_params = getattr(tool, "input_schema", None) or getattr(
                        tool, "parameters", None
                    )
                    parameters: dict[str, Any] = (
                        cast(dict[str, Any], raw_params)
                        if isinstance(raw_params, dict)
                        else default_params
                    )

                    openai_tools.append(
                        {
                            "type": "function",
                            "function": {
                                "name": tool.name,
                                "description": tool.description or "",
                                "parameters": parameters,
                            },
                        }
                    )

                self._cached_openai_tools = openai_tools
                return openai_tools
        except Exception as exc:
            logger.error("Failed to load FastMCP tools: %s", exc)
            return []

    async def call_tool(
        self,
        tool_name: str,
        arguments: dict[str, Any] | str,
    ) -> str:
        """Execute a FastMCP tool by name and return its formatted string result.

        Args:
            tool_name: The name of the registered MCP tool.
            arguments: Dictionary or JSON string of arguments.

        Returns:
            JSON string or text response from the tool execution.
        """
        if isinstance(arguments, str):
            try:
                arguments = json.loads(arguments) if arguments.strip() else {}
            except json.JSONDecodeError as exc:
                logger.warning(
                    "Invalid JSON arguments for tool '%s': %s", tool_name, exc
                )
                return json.dumps(
                    {"error": f"Invalid JSON arguments for tool '{tool_name}': {exc}"}
                )

        if not isinstance(arguments, dict):
            arguments = {}

        try:
            logger.info("Executing MCP tool '%s' with args %s", tool_name, arguments)

            async with self._get_client() as client:
                result = await client.call_tool(tool_name, arguments)

            # Extract textual output from content blocks
            texts: list[str] = []
            if hasattr(result, "content") and result.content:
                for block in result.content:
                    if isinstance(block, TextContent):
                        texts.append(block.text)
                    elif hasattr(block, "text"):
                        val = getattr(block, "text")
                        if isinstance(val, str):
                            texts.append(val)

            if texts:
                return "\n".join(texts)

            # Fallback to structured data if present
            if hasattr(result, "data") and result.data is not None:
                return json.dumps(result.data)

            if hasattr(result, "structured_content") and result.structured_content:
                return json.dumps(result.structured_content)

            return json.dumps({"status": "success", "result": str(result)})

        except Exception as exc:
            logger.exception("Error executing MCP tool '%s': %s", tool_name, exc)
            return json.dumps(
                {
                    "error": f"Error executing tool '{tool_name}': {exc}",
                }
            )
