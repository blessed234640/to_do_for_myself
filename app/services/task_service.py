from datetime import datetime, timezone
from app.db.repos import Repository
from app.services.exceptions import PastReminderError, TaskNotFoundError
from app.db.models import Task


class TaskService:
    def __init__(self, repos: Repository):
        self.repos = repos

    async def create_task(self, title: str, remind_at: datetime | None):
        now = datetime.now(timezone.utc)
        if remind_at is not None and remind_at <= now:
            raise PastReminderError("Нельзя установить напоминание в прошлом!")
        
        task = await self.repos.create_task(title = title, remind_at = remind_at)
        return task
    
    async def update_task(self, task_id: int, title: str, remind_at: datetime | None):
        task = await self.repos.get_task(task_id)
        if not task:
            raise TaskNotFoundError(f"Задача с id {task_id} не найдена")
        
        now = datetime.now(timezone.utc)
        if remind_at is not None and remind_at <= now:
            raise PastReminderError("Нельзя перенести напоминание на прошлое время!")
        
        time_changed = task.remind_at != remind_at
        reminder_sent = False if time_changed else task.reminder_sent
        return await self.repos.update_task(task, title, remind_at, reminder_sent)

    async def list_tasks(self) -> list[Task]:
        return await self.repos.list_tasks()

    async def get_task(self, task_id: int) -> Task:
        task = await self.repos.get_task(task_id)
        if not task:
            raise TaskNotFoundError(f"Задача с id {task_id} не найдена")
        return task

    async def complete_task(self, task_id: int) -> Task:
        task = await self.repos.complete_task(task_id)
        if not task:
            raise TaskNotFoundError(f"Задача с id {task_id} не найдена")
        return task

    async def delete_task(self, task_id: int) -> Task:
        task = await self.repos.delete_task(task_id)
        if not task:
            raise TaskNotFoundError(f"Задача с id {task_id} не найдена")
        return task