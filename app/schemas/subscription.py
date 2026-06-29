from pydantic import BaseModel


class SubscriptionKeys(BaseModel):
    p256dh: str
    auth: str

class SubscriptionCreate(BaseModel):
    endpoint: str
    keys: SubscriptionKeys