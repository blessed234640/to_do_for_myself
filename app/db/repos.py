from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.db.models import Task, PushSubscription


class Repository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_task(self, title: str, remind_at: datetime | None) -> Task:
        task = Task(title=title, remind_at=remind_at)
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def list_tasks(self) -> list[PushSubscription]:
        query = select(Task)
        result = await self.session.execute(query)
        return list(result.scalars().all())
    
    async def list_subscriptions(self,) -> list[Task]:
        query = select(PushSubscription)
        result = await self.session.execute(query)
        return list(result.scalars().all())
    
    async def get_task(self, task_id: int) -> Task | None:
        return await self.session.get(Task, task_id)
    
    async def complete_task(self, task_id: int) -> Task | None:
        task = await self.get_task(task_id)
        if task:
            task.is_done=True
            task.reminder_sent=True
            await self.session.commit()
            await self.session.refresh(task)
        return task
    
    async def delete_task(self, task_id: int) -> Task | None:
        task = await self.get_task(task_id)
        if task:
            await self.session.delete(task)
            await self.session.commit()
            return task
        return None
    
    async def get_due_reminders(self, now_utc: datetime) -> list[Task]:
        query = select(Task).where(
            Task.remind_at.is_not(None),
            Task.remind_at <= now_utc,
            Task.reminder_sent == False,
            Task.is_done == False
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
    
    async def mark_reminder_sent(self, task_id: int) -> bool:
        task = await self.get_task(task_id)
        if task:
            task.reminder_sent = True
            await self.session.commit()
            return True
        return False
    
    async def update_task(self, task: Task, title: str, remind_at: datetime | None, reminder_sent: bool) -> Task:
        task.title = title
        task.remind_at = remind_at
        task.reminder_sent = reminder_sent
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def upsert_subscription(self, endpoint: str, p256dh: str, auth: str) -> PushSubscription:
        query = select(PushSubscription).where(PushSubscription.endpoint == endpoint)
        result = await self.session.execute(query)
        sub = result.scalar_one_or_none()

        if sub:
            sub.p256dh = p256dh
            sub.auth = auth
        else:
            sub = PushSubscription(endpoint=endpoint, p256dh=p256dh, auth=auth)
            self.session.add(sub)

        await self.session.commit()
        await self.session.refresh(sub)
        return sub

    async def delete_subscription(self, sub: PushSubscription) -> None:
        await self.session.delete(sub)
        await self.session.commit()