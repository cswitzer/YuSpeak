from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "YuSpeak"
    debug: bool = False
    openai_api_key: str

    class Config:
        env_file = ".env"
