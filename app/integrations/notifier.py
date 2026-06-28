from typing import Protocol
from app.db.models import PushSubscription


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