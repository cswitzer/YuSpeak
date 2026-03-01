from pydantic import BaseModel
from app.schemas.evaluation import EvaluationResponse
from app.schemas.pronunciation import PronunciationResult


class AnalysisResponse(BaseModel):
    evaluation: EvaluationResponse
    pronunciation: PronunciationResult | None = None
