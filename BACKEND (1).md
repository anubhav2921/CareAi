# Backend

## Stack

- **FastAPI** (Python)
- **SQLAlchemy** ORM over **PostgreSQL**
- **Redis** for cache + Celery broker
- **Celery** (+ Celery Beat for scheduling) for all async/heavy work

## Service structure

```
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── auth.py
│   │   ├── reports.py
│   │   ├── analysis.py
│   │   ├── audio.py
│   │   ├── doctors.py
│   │   ├── hospitals.py
│   │   ├── reminders.py
│   │   └── notifications.py
│   │
│   ├── models/            # SQLAlchemy models
│   ├── schemas/            # Pydantic request/response schemas
│   │
│   ├── services/
│   │   ├── report_service.py
│   │   ├── analysis_service.py
│   │   ├── rag_service.py
│   │   ├── audio_service.py
│   │   ├── notification_service.py
│   │   └── reminder_service.py
│   │
│   ├── ai/
│   │   ├── extraction/
│   │   ├── classification/
│   │   ├── rag/
│   │   ├── safety/
│   │   └── prompts/
│   │
│   ├── workers/            # Celery tasks
│   ├── repositories/       # DB access layer
│   ├── security/           # auth, encryption helpers
│   └── config/
│
├── tests/
├── Dockerfile
└── requirements.txt
```

Rule of thumb: **no giant `main.py`.** Routes stay thin; business logic
lives in `services/`; DB access lives in `repositories/`; AI logic lives in
`ai/`.

## API surface (versioned)

```
/api/v1/auth
/api/v1/users
/api/v1/reports
/api/v1/reports/{id}
/api/v1/reports/{id}/analysis
/api/v1/reports/{id}/audio
/api/v1/reports/{id}/pdf
/api/v1/reports/{id}/chat
/api/v1/doctors
/api/v1/hospitals
/api/v1/reminders
/api/v1/notifications
```

## Async job pattern

Upload never blocks on AI work:

```
POST /api/v1/reports
→ { "report_id": "rep_83921", "status": "processing" }

GET /api/v1/reports/rep_83921
→ { "status": "completed" | "processing" | "failed", ... }
```

Real-time progress can later be upgraded to WebSockets or Server-Sent
Events; polling is fine for v1.

## Why a queue is required

If a single request path did OCR → LLM → PDF → audio synchronously, API
servers would fall over under concurrent uploads. Instead:

```
User → FastAPI → Redis Queue → Worker 1 (OCR)
                              → Worker 2 (Analysis)
                              → Worker 3 (Audio)
                              → Worker 4 (PDF)
```

## Provider abstraction (avoid vendor lock-in)

Don't call `openai.chat(...)` or a specific TTS/OCR SDK directly from
business logic. Wrap each in an interface:

```python
class LLMProvider:
    def generate(...): ...

class EmbeddingProvider:
    def embed(...): ...

class TTSProvider:
    def synthesize(...): ...
```

This lets you swap models/providers (e.g. LLM v1 → v2) without touching the
rest of the backend.

## Authentication & authorization

- Proper auth from day one: email/password or passwordless, Google login,
  phone auth, MFA later.
- Every report/resource request must be authorized **server-side** against
  the requesting user — never rely on frontend-only checks.

## Cost/usage tracking

Each report can trigger OCR + LLM + embeddings + RAG + safety model + PDF +
TTS + storage costs. Track per-report:

```
report_id, ocr_cost, llm_input_tokens, llm_output_tokens,
embedding_tokens, tts_characters, storage_size, total_estimated_cost
```

This becomes essential once the platform is monetized.

See `docs/AI_RAG_PIPELINE.md` for the `ai/` layer in detail and
`docs/DATABASE.md` for the underlying schema.
