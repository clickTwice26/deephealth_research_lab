from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "DeepHealth Research Lab API"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://api.deephealthlab.com",
        "https://api.deephealthlab.com",
        "http://deephealthlab.com",
        "https://deephealthlab.com",
    ]
    MONGODB_URL: str
    SECRET_KEY: str = "changeme_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080 # 7 days
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    
    # Email Settings
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""
    MAIL_PORT: int = 587
    MAIL_SERVER: str = ""
    MAIL_FROM_NAME: str = "DeepHealth Lab"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True
    VALIDATE_CERTS: bool = True
    FRONTEND_URL: str
    BACKEND_URL: str = "http://localhost:9191"
    
    # AWS Settings
    AWS_ACCESS_KEY: Optional[str] = None
    AWS_ACCESS_SECRET_KEY: Optional[str] = None
    AWS_STORAGE_BUCKET_NAME: Optional[str] = None
    AWS_S3_REGION_NAME: Optional[str] = None
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
