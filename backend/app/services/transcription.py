from fastapi import HTTPException
from app.services.openai_client import client
from app.core.logging import logger


async def transcribe_audio(filename: str, audio_bytes: bytes, content_type: str) -> str:
    try:
        transcription = await client.audio.transcriptions.create(
            model="whisper-1", file=(filename, audio_bytes, content_type)
        )
        return transcription.text
    except Exception as e:
        logger.error(f"Transcription failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
