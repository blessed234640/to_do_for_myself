from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./app.db"
    reminder_interval_seconds: int = 60
    

    vapid_public_key: str|None
    vapid_private_key: str|None
    vapid_subject: str|None

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
