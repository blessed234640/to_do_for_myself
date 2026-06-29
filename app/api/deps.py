from sqlalchemy.ext.asyncio import AsyncSession
from collections.abc import AsyncGenerator
from app.db.repos import Repository
from app.services.task_service import TaskService
from app.services.reminder_service import ReminderService
from app.integrations.notifier import PushSender, ConsoleNotifier
from app.db.session import async_session_maker 
from fastapi import Depends

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

async def get_repository(session: AsyncSession = Depends(get_session)) -> Repository:
    return Repository(session)

async def get_task_service(repos: Repository = Depends(get_repository)) -> TaskService:
    return TaskService(repos)

async def get_notifier() -> PushSender:
    return ConsoleNotifier()

async def get_reminder_service(repos: Repository = Depends(get_repository),
    notifier: PushSender = Depends(get_notifier)) -> ReminderService:
    return ReminderService(repos, notifier)
