from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "DeepHealth Research Lab API"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]

settings = Settings()
