from fastapi import HTTPException
from app.services.openai_client import client
from app.core.logging import logger


EVALUTION_PROMPT = """
You are an expert Mandarin Chinese teacher who specializes in helping English-speaking learners.

Your job is to evaluate spoken Chinese sentences for:
- grammatical correctness
- word usage
- naturalness compared to native speakers

Be strict but encouraging.
Focus on correctness AND how a native speaker would actually say it.

You must return valid JSON only in this format:
{
  "grammar_score": 0-10,
  "word_usage_score": 0-10,
  "naturalness_score": 0-10,
  "errors": [
    {
      "type": "grammar|word_usage|word_order|unnatural_expression",
      "original": "...",
      "corrected": "...",
      "explanation": "English explanation"
    }
  ],
  "corrected_sentence": "...",
  "more_natural_native_version": "...",
  "overall_feedback": "..."
}
Do not include explanations outside the JSON.
"""


async def evaluate_speech(text: str) -> dict:
    try:
        evaluation = await client.responses.create(
            model="gpt-4o",
            input=[
                {"role": "system", "content": EVALUTION_PROMPT},
                {"role": "user", "content": text},
            ],
        )
        return evaluation.output_text
    except Exception as e:
        logger.error(f"Evaluation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")
