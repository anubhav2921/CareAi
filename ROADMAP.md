# Roadmap

Don't build everything at once. Below is the phased plan, from MVP through
production hardening.

## V1 — MVP

```
1. Upload report
2. Detect report type
3. Extract information
4. Humanized explanation
5. Highlight important findings
6. Generate PDF
7. AI voice explanation
8. Ask questions about the report
```

Support **one report type first** (e.g. CBC only) — don't start with 50
report types.

## V2

- Report history + trend comparison across past reports
- Doctor discovery
- Hospital discovery
- Email delivery
- WhatsApp delivery

## V3

- Reminders
- Longitudinal health timeline / dashboard
- Multilingual support (beyond Hindi/English/Hinglish)
- Wearable/device integration
- More advanced imaging support (CT, MRI, more radiology types)

## Detailed build sequence

**Phase 1 — Foundation**
Learn/build: Git, Docker, Next.js, FastAPI, PostgreSQL, REST APIs,
authentication, cloud basics.
Ship: Login → Dashboard → Upload → Store report.

**Phase 2 — AI ingestion**
Build: Upload → OCR → document classification → structured extraction.
Scope: CBC only.

**Phase 3 — RAG**
Build: extracted CBC values → knowledge retrieval → LLM → human
explanation, with citations/source tracking and safety checks from the
start.

**Phase 4 — Report generation**
Build: AI analysis → HTML template → PDF.

**Phase 5 — Audio**
Build: analysis → audio script → TTS → MP3.

**Phase 6 — History**
Build: multiple reports → timeline → trend analysis.

**Phase 7 — Healthcare discovery**
Build: hospitals, doctors, specialties, maps integration.

**Phase 8 — Notifications**
Build: email, WhatsApp, push.

**Phase 9 — Reminders**
Build: scheduler → Celery → notification service.

**Phase 10 — Production hardening**
Focus: security, monitoring, logging, testing, rate limiting, backups,
disaster recovery, privacy, auditability, cost optimization.

## Why this order

Each phase maps directly onto a GenAI/ML learning path, so the project can
be built incrementally while learning the underlying technology rather than
learning it all in the abstract first:

```
Python → NumPy/Pandas → ML fundamentals → Tensors → Deep Learning →
Computer Vision → Transformers → LLMs → Embeddings → Vector Databases →
RAG → Multimodal AI → Agents/Tool Calling → Medical Report AI
```
