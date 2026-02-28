from typing import List

from pydantic import BaseModel


class Phoneme(BaseModel):
    phoneme: str
    score: float


class WordPronunciation(BaseModel):
    word: str
    score: float
    error: str
    phonemes: List[Phoneme]


class PronunciationResult(BaseModel):
    overall: float
    accuracy: float
    fluency: float
    completeness: float
    words: List[WordPronunciation]
