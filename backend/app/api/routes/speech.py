import asyncio
from fastapi import APIRouter, UploadFile, File
from app.services.evaluation import evaluate_speech
from app.services.transcription import transcribe_audio
from app.services.pronunciation import analyze_pronunciation
from app.schemas.analysis import AnalysisResponse

router = APIRouter(prefix="/speech", tags=["speech"])


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_speech(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        transcript = await transcribe_audio(
            file.filename, audio_bytes=audio_bytes, content_type=file.content_type
        )

        pronunciation_result, evaluation_result = await asyncio.gather(
            analyze_pronunciation(audio_bytes), evaluate_speech(transcript)
        )

        return AnalysisResponse(
            evaluation=evaluation_result.output[0].content[0].parsed.dict(),
            pronunciation=pronunciation_result,
        )
    except Exception as e:
        return {"error": str(e)}
