from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.config import settings
from app.db.session import async_session_maker
from app.db.repos import Repository
from app.services.reminder_service import ReminderService
from app.integrations.notifier import WebPushNotifier

scheduler = AsyncIOScheduler(timezone="UTC")


async def run_due_reminders():
    # Фоновая джоба выполняется ВНЕ HTTP-запроса -> Depends() недоступен,
    # поэтому сессию/сервис собираем руками из async_session_maker.
    async with async_session_maker() as session:
        repo = Repository(session)
        notifier = WebPushNotifier()
        service = ReminderService(repo, notifier)
        await service.send_due_reminders()


def start_scheduler():
    scheduler.add_job(
        run_due_reminders,
        "interval",
        seconds=settings.reminder_interval_seconds,
        id="due_reminders",
        replace_existing=True,
    )
    scheduler.start()
