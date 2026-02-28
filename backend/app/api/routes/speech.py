from fastapi import APIRouter, UploadFile, File
from app.services.evaluation import evaluate_speech
from app.services.transcription import transcribe_audio
from app.schemas.evaluation import EvaluationResponse

router = APIRouter(prefix="/speech", tags=["speech"])


@router.post("/analyze", response_model=EvaluationResponse)
async def analyze_speech(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        transcript = await transcribe_audio(
            file.filename, audio_bytes=audio_bytes, content_type=file.content_type
        )

        # TODO: Run this and the azure pronunciation assessment in parallel to save time
        # Combine the results in the final output after asyncio.gather completes
        evaluation = await evaluate_speech(transcript)
        return evaluation.output[0].content[0].parsed.dict()
    except Exception as e:
        return {"error": str(e)}
