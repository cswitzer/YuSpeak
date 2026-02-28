from openai import AsyncOpenAI
from app.core.config import Settings

settings = Settings()

client = AsyncOpenAI(api_key=settings.openai_api_key)
