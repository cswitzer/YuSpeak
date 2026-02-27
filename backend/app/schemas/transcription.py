from pydantic import BaseModel


class TranscriptResponse(BaseModel):
    transcript: str
    language: str | None = None
