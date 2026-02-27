from fastapi import FastAPI
from app.core.config import Settings

settings = Settings()
app = FastAPI()
