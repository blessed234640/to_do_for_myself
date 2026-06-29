from datetime import datetime, timezone
from app.db.repos import Repository
from app.integrations.notifier import PushSender
import logging

logger = logging.getLogger(__name__)


class ReminderService:

    def __init__(self, repos: Repository, notifier: PushSender):
        self.repos = repos
        self.notifier = notifier


    async def send_due_reminders(self) -> int:
        now = datetime.now(timezone.utc)
        tasks = await self.repos.get_due_reminders(now)
        if not tasks:
            logger.info("Нет активных уведомлений для отправки.")
            return 0

        subscriptions = await self.repos.list_subscriptions()
        if not subscriptions:
            logger.warning("Задачи есть, но в базе нет ни одной push-подписки.")
            return 0
        

        title = "Напоминание"
        sent = 0

        for task in tasks:
            body = task.title
            for sub in subscriptions:
                try:
                    await self.notifier.send(sub, title, body)
                except Exception:
                    logger.exception("Не удалось отправить пуш на подписку %s", sub.id)
            await self.repos.mark_reminder_sent(task.id)
            sent += 1
        logger.info("Разослано напоминаний: %d", sent)
        return sent