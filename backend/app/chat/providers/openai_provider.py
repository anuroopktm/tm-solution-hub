from collections.abc import AsyncIterator
from typing import cast

from openai import AsyncOpenAI
from openai.types.chat import (
    ChatCompletion,
    ChatCompletionMessageParam,
    ChatCompletionToolUnionParam,
)

from app.chat.providers.base import BaseLLMProvider, Message
from app.core.config import settings


class OpenAIProvider(BaseLLMProvider):
    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured")
        if not settings.OPENAI_MODEL:
            raise ValueError("OPENAI_MODEL is not configured")

        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
        )

        self.model: str = settings.OPENAI_MODEL

    async def generate(
        self,
        messages: list[Message],
        tools: list[dict[str, object]] | None = None,
    ) -> ChatCompletion:
        if tools:
            return await self.client.chat.completions.create(
                model=self.model,
                messages=cast(list[ChatCompletionMessageParam], messages),
                tools=cast(list[ChatCompletionToolUnionParam], tools),
                tool_choice="auto",
            )

        return await self.client.chat.completions.create(
            model=self.model,
            messages=cast(list[ChatCompletionMessageParam], messages),
        )

    async def stream(self, messages: list[Message]) -> AsyncIterator[str]:
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=cast(list[ChatCompletionMessageParam], messages),
            stream=True,
        )

        async for chunk in response:
            if not chunk.choices:
                continue

            content = chunk.choices[0].delta.content
            if content:
                yield content
