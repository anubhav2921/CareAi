# Database & Storage

## PostgreSQL — primary datastore

Suggested tables:

```
users
profiles
reports
report_files
report_pages
extracted_values
findings
analysis_results
rag_documents
rag_chunks
conversations
messages
audio_files
generated_pdfs
reminders
notifications
healthcare_providers
hospitals
audit_logs
consents
```

Relationships:

```
User
 │
 ├── Reports
 │     ├── Files
 │     ├── Findings
 │     ├── Analysis
 │     ├── Audio
 │     └── PDF
 │
 ├── Conversations
 ├── Reminders
 └── Notifications
```

`reminders` table shape:

```
id, user_id, report_id, title, scheduled_at, timezone, channel, status, created_at
```

`audit_logs` and `consents` exist from day one — this is medical data, so
every access and every consent grant/revoke should be recorded.

## Vector database — pgvector (start here, not a dedicated vector DB)

Because PostgreSQL is already required, use the **pgvector** extension for
embeddings initially rather than standing up Pinecone/Weaviate on day one:

```
PostgreSQL
 ├── users
 ├── reports
 ├── findings
 ├── reminders
 ├── conversations
 └── embeddings   (pgvector)
```

Move to a dedicated vector DB later only if retrieval scale genuinely
requires it.

### RAG source versioning

Every embedded knowledge chunk should carry:

```
document, source, version, publication_date, retrieval_date,
embedding_model, chunk_id
```

This gives you traceability: when the system explains something, you can
answer "which knowledge source supported this explanation?" — and
optionally surface an "Information sources" section in the UI instead of
implying the LLM invented the answer.

## Object storage — S3-compatible

Never store medical PDFs/images directly inside PostgreSQL. Store them in
object storage and keep only metadata in the DB:

```
S3
├── original-reports/
├── processed-documents/
├── generated-pdfs/
├── audio/
└── temporary/
```

DB record per file:

```
file_id, bucket, object_key, mime_type, size, checksum, created_at
```

Use **private buckets** and **short-lived signed URLs** for all access —
never public buckets for patient documents.

## Redis

Used for: Celery broker/backend, caching, rate-limit counters, and (later)
Celery Beat scheduling for reminders.
