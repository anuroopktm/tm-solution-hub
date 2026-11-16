import sys
from pathlib import Path

# Ensure the backend root directory is in sys.path for CLI runners and module resolution
_backend_root = str(Path(__file__).resolve().parent.parent.parent)
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

from fastmcp import FastMCP

mcp = FastMCP(
    name="TM Solution Hub",
    instructions=(
        "ThoughtMinds Solution Hub assistant server. "
        "Provides tools to search, inspect, and analyze enterprise solutions, "
        "technical architectures, reusable components, and documentation."
    ),
)

# Register MCP tools by importing tool modules
from app.mcp.tools import analytics, categories, solutions  # noqa: E402

# Explicit reference to register tools and satisfy static type checkers (Pylance/Pyright)
_TOOL_MODULES = (analytics, categories, solutions)

if __name__ == "__main__":
    mcp.run()
