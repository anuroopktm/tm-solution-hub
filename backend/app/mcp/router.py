"""FastMCP router and mounting configuration."""

from fastapi import FastAPI

from app.mcp.server import mcp

# Create the FastMCP ASGI application
mcp_app = mcp.http_app(path="/")


def register_mcp(app: FastAPI, prefix: str = "/mcp") -> None:
    """Mount the FastMCP server onto a parent FastAPI application.

    Args:
        app: The parent FastAPI application instance.
        prefix: URL path prefix to mount MCP on (default: '/mcp').
    """
    app.mount(prefix, mcp_app)
