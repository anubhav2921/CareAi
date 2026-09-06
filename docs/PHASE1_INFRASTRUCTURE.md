# CareAI Phase 1 Infrastructure

This document outlines the local infrastructure configuration, required software, and operational commands for CareAI Phase 1.

## Required Software

- **Docker Desktop**: The entire local development environment relies on Docker containers for database and background task management.
- **Node.js (v18+)**: For running the Next.js frontend.
- **Python (3.11+)**: (Optional) For running backend unit tests outside of Docker.


## Environment Variables

A template `.env.example` file is provided in the `backend/` directory. Copy it to `.env` and adjust the variables if not using the Docker defaults. 

**Key Variables:**
- `DATABASE_URL`: Connection string for PostgreSQL. In Docker, it must use the service name: `postgresql://careai_user:careai_password@postgres:5432/careai_db`
- `REDIS_URL`: Connection string for Redis. In Docker, it must use the service name: `redis://redis:6379/0`
- `STORAGE_PATH`: Path for private file storage (e.g., `/app/.storage` inside Docker).

## Startup Commands

Start the full stack using Docker Compose:

```bash
# Start Postgres and Redis in the background
docker-compose up -d postgres redis

# Build and start the backend and celery worker
docker-compose up -d --build backend worker
```

## Migration Commands

Database schema migrations are handled by Alembic. The models and `env.py` are properly configured to pick up the `DATABASE_URL` from the application's config.

```bash
# To generate a new migration after modifying models:
docker-compose run backend alembic revision --autogenerate -m "description"

# To apply migrations to the database:
docker-compose run backend alembic upgrade head
```

## API Test Commands

You can run the FastAPI test suite using `pytest`. The tests are configured to use an in-memory SQLite database (`conftest.py`).

```bash
# Using a local virtual environment:
python -m venv venv
.\venv\Scripts\activate
pip install -r backend/requirements.txt
set PYTHONPATH=backend
pytest backend/tests
```

## Worker Commands

The Celery worker manages background tasks. To view worker logs when running via Docker:

```bash
docker-compose logs -f worker
```

To run a worker locally outside of Docker (requires a local Redis server):
```bash
cd backend
celery -A app.worker.celery_app worker --loglevel=info
```

## Troubleshooting

- **Database Connection Refused**: Ensure the Postgres container is fully started and healthy before the backend runs. `docker-compose.yml` includes a `healthcheck` to delay startup until the DB is ready.
- **Redis Connection Refused**: Verify that the `REDIS_URL` uses `redis://redis:6379/0` instead of `localhost` when the backend/worker is running inside Docker.
- **Missing Migrations**: If tables are missing, ensure you run `alembic upgrade head`. For tests, SQLite creates tables automatically via `Base.metadata.create_all()`.

## Status
**WORKING:**
- Docker (services build and run cleanly)
- PostgreSQL (via Alembic migrations, tables exist)
- Redis (broker and backend active)
- Celery (worker running as non-root)
- FastAPI (health and upload endpoints active)
- Alembic (initial migration created and applied)
- Upload Pipeline (handles transaction safety correctly)
- PDF Text Extraction (implemented via PyPDF2)
- CBC Processor
- Mock AI (produces safe test output)

**NOT IMPLEMENTED:**
- Real OCR for images
- Real LLM integration
- RAG (Retrieval-Augmented Generation)
- Imaging analysis (X-ray, ultrasound)

## Current Limitations
- **No Real LLM Integration Yet**: The OCR extraction and AI analysis are strictly mocked out for Phase 1.
- **SQLite Fallback**: SQLite is being used as a fallback for unit testing.

