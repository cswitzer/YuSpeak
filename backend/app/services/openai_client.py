import os
from openai import AsyncOpenAI

api_key = os.environ["OPENAI_API_KEY"]
client = AsyncOpenAI(api_key=api_key)
