from pydantic import BaseModel
from typing import List


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
