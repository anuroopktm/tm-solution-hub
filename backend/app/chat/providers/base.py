from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from typing import Any, TypedDict


class Message(TypedDict, total=False):
    role: str
    content: str | None
    name: str
    tool_call_id: str
    tool_calls: list[Any]


class BaseLLMProvider(ABC):

    @abstractmethod
    async def generate(
        self, messages: list[Message], tools: list[dict[str, object]] | None = None
    ) -> Any:
        pass

    @abstractmethod
    def stream(self, messages: list[Message]) -> AsyncIterator[str]:
        pass
