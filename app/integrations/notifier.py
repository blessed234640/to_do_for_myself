import json
import asyncio
import logging
from typing import Protocol
from pywebpush import webpush, WebPushException
from app.config import settings
from app.db.models import PushSubscription

logger = logging.getLogger(__name__)


class PushSender(Protocol):
    async def send(
        self,
        subscription: PushSubscription,
        title: str,
        body: str
    ) -> None:
        ...

class ConsoleNotifier:
    async def send(
        self,
        subscription: PushSubscription,
        title: str,
        body: str
    ) -> None:
        short_endpoint = f"{subscription.endpoint[:20]}..." if subscription.endpoint else "None"
        print("\n" + "="*40)
        print(f"[FAKE PUSH] Отправка уведомления!")
        print(f"На устройство (Endpoint): {short_endpoint}")
        print(f"Заголовок: {title}")
        print(f"Текст: {body}")
        print("="*40 + "\n")


class SubscriptionExpiredError(Exception):
    def __init__(self, subscription: PushSubscription):
        self.subscription = subscription


class WebPushNotifier:
    async def send(
        self,
        subscription: PushSubscription,
        title: str,
        body: str
    ) -> None:
        sub_info = {
            "endpoint": subscription.endpoint,
            "keys": {"p256dh": subscription.p256dh, "auth": subscription.auth},
        }
        payload = json.dumps({"title": title, "body": body})
        try:
            # pywebpush СИНХРОННЫЙ (requests под капотом) -> выносим в тред,
            # иначе блокируем event loop async-приложения.
            await asyncio.to_thread(
                webpush,
                subscription_info=sub_info,
                data=payload,
                vapid_private_key=settings.vapid_private_key,
                vapid_claims={"sub": settings.vapid_subject},
                timeout=10,  # без таймаута зависший endpoint вешает джобу планировщика навсегда
            )
        except WebPushException as e:
            status = e.response.status_code if e.response is not None else None
            if status in (404, 410):
                # подписка мертва (отозвали разрешение / переустановили браузер)
                raise SubscriptionExpiredError(subscription) from e
            if status is None and "key specified" in str(e):
                # битый p256dh/auth ключ устройства -> подписка нерабочая навсегда.
                # (ошибка возникает ДО HTTP-запроса, response отсутствует.)
                raise SubscriptionExpiredError(subscription) from e
            # прочее (обрыв TLS, таймаут, 5xx) -> временный сбой, подписку НЕ трогаем
            raise