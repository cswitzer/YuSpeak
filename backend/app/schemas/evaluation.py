from pydantic import BaseModel
from typing import List, Optional

from app.schemas.pronunciation import PronunciationResult


class Mistake(BaseModel):
    type: str
    original: str
    corrected: str
    explanation: str


class EvaluationResponse(BaseModel):
    overall_score: int
    grammar_score: int
    vocabulary_score: int
    fluency_score: int
    mistakes: List[Mistake]
    original_sentence: str
    corrected_sentence: str
    more_natural_native_version: str
    overall_feedback: str

    # From Azure Pronunciation Assessment API
    pronunciation: Optional[PronunciationResult] = None
