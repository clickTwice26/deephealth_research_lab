from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "DeepHealth Research Lab API"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    MONGODB_URL: str

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
