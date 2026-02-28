from fastapi import HTTPException
from app.services.openai_client import client
from app.core.logging import logger
from app.schemas.evaluation import EvaluationResponse


EVALUTION_PROMPT = """
You are an expert Mandarin Chinese teacher who specializes in helping English-speaking learners.

Your job is to evaluate spoken Chinese sentences for:
- grammatical correctness
- word usage
- naturalness compared to native speakers

Be strict but encouraging.
Focus on correctness AND how a native speaker would actually say it. Show a preference for spoken,
natural language over textbook, formal language. If the sentence is grammatically correct but unnatural, 
point that out and show a more natural way to say it.

Additionally, in the overall feedback, provide some encouragement when the student does something right 
so that they feel motivated to keep learning and improving.

You must return valid JSON only in this format:
{
  "overall_score": 0-10,
  "grammar_score": 0-10,
  "vocabulary_score": 0-10,
  "fluency_score": 0-10,
  "mistakes": [
    {
      "type": "grammar|word_usage|word_order|unnatural_expression",
      "original": "...",
      "corrected": "...",
      "explanation": "English explanation"
    }
  ],
  "original_sentence": "...",
  "corrected_sentence": "...",
  "more_natural_native_version": "...",
  "overall_feedback": "..."
}
Do not include explanations outside the JSON.
"""


async def evaluate_speech(text: str) -> EvaluationResponse:
    try:
        evaluation = await client.responses.parse(
            model="gpt-4o",
            input=[
                {"role": "system", "content": EVALUTION_PROMPT},
                {"role": "user", "content": text},
            ],
            text_format=EvaluationResponse,
        )
        return evaluation
    except Exception as e:
        logger.error(f"Evaluation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")
