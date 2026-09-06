# CareAI — Health AI Platform

> Your medical reports, explained.

An AI-powered personal health-report companion that converts complex medical
documents (lab reports, X-rays, ultrasounds, prescriptions, etc.) into
humanized explanations — delivered as text, a downloadable PDF, and an audio
summary — with optional doctor/hospital discovery and follow-up reminders.

**Positioning boundary:** this product *explains and organizes* medical
information. It does not diagnose, prescribe, or replace a qualified
healthcare professional. Every AI-generated explanation passes through a
safety layer before reaching the user.

## Repo map

This is a monorepo. See each doc below for details on that layer.

| Doc | Covers |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System-level architecture, the 5 "engines", data flow |
| [`docs/FRONTEND.md`](docs/FRONTEND.md) | Next.js app structure, pages, UI flow |
| [`docs/BACKEND.md`](docs/BACKEND.md) | FastAPI service structure, API routes |
| [`docs/DATABASE.md`](docs/DATABASE.md) | PostgreSQL schema, object storage, vector DB |
| [`docs/AI_RAG_PIPELINE.md`](docs/AI_RAG_PIPELINE.md) | Report processing pipeline, RAG, safety layer |
| [`docs/NOTIFICATIONS_REMINDERS.md`](docs/NOTIFICATIONS_REMINDERS.md) | Email/WhatsApp/push notifications, reminder scheduler |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Infrastructure, CI/CD, environments |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Phased build plan (MVP → V2 → V3) |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Privacy, encryption, safety-layer rules |

## Folder layout

```
CareAI/
│
├── frontend/                # Next.js + TypeScript
├── backend/                 # FastAPI
├── docs/                    # Documentation
└── docker-compose.yml
```

## The 5 engines (mental model)

1. **Understanding Engine** — OCR + extraction + multimodal AI ("what's in the report?")
2. **Knowledge Engine** — RAG over trusted medical sources ("what does this generally mean?")
3. **Safety Engine** — validation, uncertainty checks, guardrails ("is this claim supported?")
4. **Communication Engine** — text + PDF + audio, multilingual ("how do we explain it to the patient?")
5. **Continuity Engine** — history, reminders, notifications, doctor/hospital discovery ("what's next?")

## Tech stack at a glance

Frontend: Next.js, TypeScript, Tailwind, shadcn/ui  
Backend: FastAPI, PostgreSQL (+ pgvector), Redis, Celery  
Storage: S3-compatible object storage  
AI: OCR provider, multimodal LLM, embeddings, RAG, TTS  
Infra: Docker, Terraform, GitHub Actions, AWS (or GCP/Azure)

Full details in `docs/ARCHITECTURE.md` and `docs/DEPLOYMENT.md`.

## MVP scope (v1)

Upload → detect report type → extract data → humanized explanation →
highlight abnormal findings → generate PDF → generate audio → ask questions
about the report.

Everything else (history, doctor/hospital discovery, WhatsApp/email delivery,
reminders) is v2/v3 — see `docs/ROADMAP.md`.

## Getting started locally

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
