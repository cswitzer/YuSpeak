import azure.cognitiveservices.speech as speechsdk
import asyncio
import json

from app.core.config import Settings

settings = Settings()


async def analyze_pronunciation(
    audio_bytes: bytes, reference_text: str = "", language: str = "zh-CN"
):
    speech_config = speechsdk.SpeechConfig(
        subscription=settings.azure_speech_key, region=settings.azure_speech_region
    )

    stream = speechsdk.audio.PushAudioInputStream()
    stream.write(audio_bytes)
    stream.close()

    audio_config = speechsdk.audio.AudioConfig(stream=stream)

    pronunciation_config = speechsdk.PronunciationAssessmentConfig(
        reference_text=reference_text,
        grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
        granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
        enable_miscue=True,
    )

    recognizer = speechsdk.SpeechRecognizer(
        speech_config=speech_config,
        language=language,
        audio_config=audio_config,
    )
    pronunciation_config.apply_to(recognizer=recognizer)

    # Note: For Python, recognize_once_async does not support async await as it would in C# and Java. Just run
    # it in another thread to avoid blocking the main event loop.
    result = await asyncio.to_thread(recognizer.recognize_once)

    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        pa = speechsdk.PronunciationAssessmentResult(result)
        data = json.loads(
            result.properties.get(speechsdk.PropertyId.SpeechServiceResponse_JsonResult)
        )
        return {
            "overall": pa.pronunciation_score,
            "accuracy": pa.accuracy_score,
            "fluency": pa.fluency_score,
            "completeness": pa.completeness_score,
            "words": [
                {
                    "word": w["Word"],
                    "score": w["PronunciationAssessment"]["AccuracyScore"],
                    "error": w["PronunciationAssessment"]["ErrorType"],
                    "phonemes": [
                        {
                            "phoneme": ph["Phoneme"],
                            "score": ph["PronunciationAssessment"]["AccuracyScore"],
                        }
                        for ph in w.get("Phonemes", [])
                    ],
                }
                for w in data["NBest"][0]["Words"]
            ],
        }
    elif result.reason == speechsdk.ResultReason.NoMatch:
        raise ValueError(f"Speech could not be recognized: {result.no_match_details}")

    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = speechsdk.CancellationDetails(result)
        raise ValueError(
            f"Speech recognition canceled: {cancellation_details.reason}, {cancellation_details.error_details}"
        )
