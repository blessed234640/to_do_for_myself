from datetime import datetime, timezone
from app.db.repos import Repository
from app.integrations.notifier import PushSender, SubscriptionExpiredError
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
            delivered = 0
            for sub in subscriptions:
                try:
                    await self.notifier.send(sub, title, body)
                    delivered += 1
                except SubscriptionExpiredError as e:
                    logger.info("Подписка %s протухла, удаляю", e.subscription.id)
                    await self.repos.delete_subscription(e.subscription)
                except Exception:
                    logger.exception(
                        "Не удалось отправить пуш на подписку %s (endpoint: %s)",
                        sub.id, sub.endpoint,
                    )

            # Помечаем отправленным ТОЛЬКО если хотя бы одна доставка удалась.
            # Иначе при временном сбое сети напоминание потерялось бы навсегда —
            # оставляем задачу на следующий тик планировщика для повтора.
            if delivered > 0:
                await self.repos.mark_reminder_sent(task.id)
                sent += 1
            else:
                logger.warning(
                    "Задача %s: ни одна доставка не удалась, повтор на следующем тике",
                    task.id,
                )

        logger.info("Разослано напоминаний: %d", sent)
        return sent