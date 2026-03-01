import asyncio
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.services.evaluation import evaluate_speech
from app.services.transcription import transcribe_audio
from app.services.pronunciation import analyze_pronunciation
from app.schemas.analysis import AnalysisResponse
from app.utils.pcm import convert_to_pcm

router = APIRouter(prefix="/speech", tags=["speech"])


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_speech(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()

        transcript, pcm_audio_bytes = await asyncio.gather(
            transcribe_audio(
                file.filename, audio_bytes=audio_bytes, content_type=file.content_type
            ),
            asyncio.to_thread(convert_to_pcm, audio_bytes),
        )

        evaluation_result, pronunciation_result = await asyncio.gather(
            evaluate_speech(transcript), analyze_pronunciation(pcm_audio_bytes)
        )

        return AnalysisResponse(
            evaluation=evaluation_result.output[0].content[0].parsed.dict(),
            pronunciation=pronunciation_result,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
