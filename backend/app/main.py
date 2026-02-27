from fastapi import FastAPI
from app.core.config import Settings
from app.api.routes.speech import router as speech_router

settings = Settings()
app = FastAPI()

app.include_router(speech_router)
