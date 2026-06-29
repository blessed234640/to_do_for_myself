import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.tasks import router as tasks_router
from app.api.subscriptions import router as subscriptions_router
from app.config import settings
from app.db.session import init_db
from app.integrations.scheduler import start_scheduler, scheduler
from app.services.exceptions import TaskNotFoundError, PastReminderError


# --- Логирование: делаем диагностику планировщика/рассылки видимой ---
_handler = logging.StreamHandler()
_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
_app_logger = logging.getLogger("app")
_app_logger.setLevel(logging.INFO)
_app_logger.addHandler(_handler)
_app_logger.propagate = False
# чтобы видеть ошибки джоб APScheduler
logging.getLogger("apscheduler").setLevel(logging.INFO)
logging.getLogger("apscheduler").addHandler(_handler)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    start_scheduler()
    yield
    scheduler.shutdown()


app = FastAPI(title="Todo с напоминаниями", lifespan=lifespan)


# --- Глобальные хендлеры доменных ошибок (перевод в HTTP в одном месте) ---
@app.exception_handler(TaskNotFoundError)
async def task_not_found_handler(request: Request, exc: TaskNotFoundError):
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(PastReminderError)
async def past_reminder_handler(request: Request, exc: PastReminderError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


# --- API роуты (регистрируются ДО catch-all маунта статики) ---
app.include_router(tasks_router)
app.include_router(subscriptions_router)


@app.get("/vapid-public-key")
def vapid_public_key():
    return {"key": settings.vapid_public_key}


# --- Фронтенд (same-origin): монтируется ПОСЛЕДНИМ, чтобы не затереть API ---
app.mount("/", StaticFiles(directory="static", html=True), name="static")
