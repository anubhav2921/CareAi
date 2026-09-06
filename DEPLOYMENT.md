# Deployment & Infrastructure

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Backend API | FastAPI + Python |
| Authentication | Auth.js / Clerk / custom OAuth |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Cache | Redis |
| Job Queue | Celery / Redis |
| Object Storage | S3-compatible storage |
| OCR | AWS Textract / Google Document AI / Azure Document Intelligence |
| Vision AI | Multimodal LLM / specialized medical vision model |
| LLM | Production LLM API |
| Embeddings | Embedding model |
| Vector DB | pgvector (initially) |
| RAG | LangChain/LlamaIndex or custom retrieval layer |
| PDF generation | Python + ReportLab |
| Audio | TTS API |
| Email | Transactional email provider |
| WhatsApp | WhatsApp Business Platform / provider |
| Maps | Google Maps / Mapbox |
| Scheduling | Celery Beat / managed scheduler |
| Monitoring | OpenTelemetry + Grafana/Datadog |
| Error tracking | Sentry |
| CI/CD | GitHub Actions |
| Containers | Docker |
| Deployment | AWS / GCP / Azure |
| Secrets | Cloud Secrets Manager |
| IaC | Terraform |

**No Kubernetes for the initial launch** — Docker + managed cloud services
is far easier to operate for a first production deployment.

## Deployment diagram (AWS example)

```
                 INTERNET
                     │
                     ▼
              Cloudflare/CDN
                     │
                     ▼
             Load Balancer
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
     Next.js App           FastAPI API
          │                     │
          │              ┌──────┴──────┐
          │              ▼             ▼
          │          PostgreSQL      Redis
          │                            │
          │                            ▼
          │                         Workers
          │                            │
          │                ┌───────────┼───────────┐
          │                ▼           ▼           ▼
          │              OCR          LLM        TTS
          │
          └───────────────────────────────────────
                           │
                           ▼
                       S3 Storage
```

Managed AWS services to lean on: CloudFront, ALB, ECS/Fargate, RDS
PostgreSQL, ElastiCache Redis, S3, CloudWatch, Secrets Manager.

## Repository layout — monorepo

```
health-ai/
│
├── frontend/          # Next.js
├── backend/           # FastAPI
├── worker/            # Celery
├── ai/                # extraction, RAG, safety
├── infrastructure/    # Terraform
├── docs/
└── docker-compose.yml
```

Monorepo gives separation of concerns without the operational overhead of
multiple repos; services can be split out later if truly needed.

## CI/CD

```
.github/
└── workflows/
    ├── frontend.yml
    ├── backend.yml
    └── worker.yml
```

Pipeline:

```
git push → GitHub Actions → Tests → Lint → Security scan →
Docker build → Push image → Deploy → Health check
```

Separate **development / staging / production** environments. Never
develop directly against production medical data.

## Observability

Instrument frontend → backend → workers → AI API calls with
OpenTelemetry. Track: request latency, LLM latency, OCR latency, queue
latency, failure rate, token usage, cost/report, processing time,
notification failures. Pair with Sentry for error tracking and a cloud
monitoring dashboard (Grafana/Datadog/CloudWatch).

See `docs/SECURITY.md` for the encryption, access-control, and audit
requirements that apply to this infrastructure.
