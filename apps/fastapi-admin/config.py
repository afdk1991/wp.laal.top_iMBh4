from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "MIXMLAAL FastAPI Admin"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./mixmlaal_fastapi.db"

    SECRET_KEY: str = "mixmlaal-secret-key-2024-fastapi-admin-jwt-token"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    class Config:
        env_file = ".env"

settings = Settings()
