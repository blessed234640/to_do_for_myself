from datetime import datetime, timezone
from pydantic import BaseModel, Field, ConfigDict, field_validator


class TaskBase(BaseModel):
    title: str = Field(min_length=3, max_length=100, description="заголовок задачи")
    remind_at: datetime | None = None


class TaskCreate(TaskBase):
    @field_validator("remind_at")
    @classmethod
    def ensure_utc(cls, value: datetime | None) -> datetime | None:
        if value is None:
            return None
            
        if value.tzinfo is None:
            raise ValueError("remind_at должен быть с таймзоной (ISO-8601 с offset)")
            
        return value.astimezone(timezone.utc)
    


class TaskOut(TaskBase):
    id: int
    is_done: bool
    created_at: datetime
    reminder_sent: bool
    model_config = ConfigDict(from_attributes=True)

    @field_validator("remind_at", "created_at")
    @classmethod
    def attach_utc(cls, value: datetime | None) -> datetime | None:
        if value is not None and value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value