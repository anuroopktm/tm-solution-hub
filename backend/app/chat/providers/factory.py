from app.chat.providers.base import BaseLLMProvider
from app.chat.providers.groq_provider import GroqProvider
from app.chat.providers.openai_provider import OpenAIProvider
from app.core.config import settings


def get_llm_provider() -> BaseLLMProvider:
    if settings.LLM_PROVIDER == "groq":
        return GroqProvider()

    if settings.LLM_PROVIDER == "openai":
        return OpenAIProvider()

    raise ValueError("Unsupported LLM provider")
