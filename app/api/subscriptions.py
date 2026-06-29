from fastapi import APIRouter, Depends, status
from app.schemas.subscription import SubscriptionCreate
from app.db.repos import Repository
from app.api.deps import get_repository

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def register_subscription(
    payload: SubscriptionCreate,
    repos: Repository = Depends(get_repository),
):
    await repos.upsert_subscription(
        endpoint=payload.endpoint,
        p256dh=payload.keys.p256dh,
        auth=payload.keys.auth,
    )
    return {"status": "ok"}