# Срок

A small reminders app: create tasks with a due time and receive a Web Push
notification when they come due. Async FastAPI backend, Vue 3 PWA frontend,
served same-origin.

## Stack

**Backend** — FastAPI (async), SQLAlchemy 2.0 + aiosqlite, APScheduler,
Web Push via VAPID (`pywebpush`), pydantic-settings.
**Frontend** — Vue 3 + TypeScript, Vite, Pinia, Reka UI, vite-plugin-pwa.

## Architecture

Pragmatic layering: `router → service → repository`. The push transport sits
behind a `PushSender` port, so the delivery implementation is swappable
(`ConsoleNotifier` for dev, `WebPushNotifier` for real pushes) without touching
the core.

A background APScheduler job polls for due reminders on an interval and sends
them to every stored push subscription. A reminder is marked sent only after at
least one delivery succeeds; dead subscriptions (HTTP 404/410, malformed keys)
are pruned, transient failures are retried.

All timestamps are stored and compared in UTC; conversion to local time happens
only at the edges (input/display).

## Project structure

```
app/
  main.py              # app, lifespan (init_db + scheduler), error handlers, static mount
  config.py            # Settings (env)
  api/                 # deps (DI), tasks router, subscriptions router
  db/                  # models, async session, repository
  services/            # TaskService, ReminderService, domain exceptions
  integrations/        # PushSender port, notifiers, APScheduler
  schemas/             # Pydantic request/response models
frontend/              # Vue 3 + Vite PWA (builds to ../static)
static/                # built frontend, served by FastAPI
```

## Requirements

- Python 3.12+
- Node.js 20+ (only to build the frontend)

## Setup

### Backend

```bash
python -m venv .venv
.venv\Scripts\activate            # Windows
pip install -r requirements.txt
```

Create a `.env` (see `.env.example`) and generate a VAPID key pair:

```bash
vapid --gen                       # writes private_key.pem / public_key.pem
vapid --applicationServerKey      # prints the public key for the frontend
```

Fill in `.env`:

| Variable                    | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `DATABASE_URL`              | SQLAlchemy URL, e.g. `sqlite+aiosqlite:///./todo.db` |
| `REMINDER_INTERVAL_SECONDS` | Scheduler poll interval                              |
| `VAPID_PUBLIC_KEY`          | base64url applicationServerKey                       |
| `VAPID_PRIVATE_KEY`         | Path to `private_key.pem`                            |
| `VAPID_SUBJECT`             | `mailto:you@example.com`                             |

Run:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Tables are created on startup. The app serves the built frontend from `static/`
at `/`, so `http://localhost:8000` is the whole application.

### Frontend

Develop against the running backend (Vite proxies the API):

```bash
cd frontend
npm install
npm run dev
```

Build into `static/` for production serving:

```bash
npm run build
```

## API

| Method | Path                    | Body                  | Response          |
| ------ | ----------------------- | --------------------- | ----------------- |
| GET    | `/tasks`                | —                     | `200 [Task]`      |
| POST   | `/tasks`                | `{title, remind_at?}` | `201 Task`        |
| GET    | `/tasks/{id}`           | —                     | `200 Task / 404`  |
| PUT    | `/tasks/{id}`           | `{title, remind_at?}` | `200 / 404 / 400` |
| POST   | `/tasks/{id}/complete`  | —                     | `200 / 404`       |
| DELETE | `/tasks/{id}`           | —                     | `200 / 404`       |
| POST   | `/subscriptions`        | `{endpoint, keys}`    | `201`             |
| GET    | `/vapid-public-key`     | —                     | `200 {key}`       |

`remind_at` is a UTC ISO-8601 string with a zone (`...Z`) or `null`; a naive
datetime is rejected with `422`, a past time with `400`.

## Web Push notes

- Push and PWA install require a secure context: `localhost` for development,
  HTTPS in production.
- Run a **single** worker — multiple scheduler instances would send duplicate
  notifications.
- Delivery goes backend → push service (FCM / Mozilla) → device. The backend
  must be able to reach the push service; the `private_key.pem` and database
  should persist across restarts.

## Deployment

Run behind a TLS-terminating reverse proxy (e.g. Caddy with automatic HTTPS),
one uvicorn worker, with `static/`, the database, and `private_key.pem` on
persistent storage. The host should stay always-on so reminders fire on time.
