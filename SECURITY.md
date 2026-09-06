# Security & Privacy

This platform handles medical data. Security is not a hardening pass at the
end — it shapes the architecture from day one.

## Encryption

```
Browser
   ↓ HTTPS
API
   ↓ encrypted
Database
   ↓ encrypted
Storage
```

- TLS in transit everywhere.
- Encryption at rest for the database and object storage.
- Secrets (API keys, DB credentials) live in a cloud secrets manager —
  never in code or plain env files committed to the repo.

## Access control

- Password hashing (never plaintext or reversible encryption for passwords).
- Role-based access control (RBAC).
- Every report/resource request is authorized **server-side** against the
  authenticated user — frontend checks are never sufficient.
- Session management with reasonable expiry; MFA as a later hardening step.

## Data minimization

- Send only what's necessary to third-party AI providers (OCR, LLM,
  embeddings, TTS) — strip unnecessary patient-identifying detail where the
  task allows it.
- Short-lived signed URLs for object storage access, not public buckets or
  permanent links.

## Auditability

- `audit_logs` table from day one: who accessed what report, when, and via
  which action.
- `consents` table: what the user has consented to (AI analysis, data
  sharing with notification providers, WhatsApp delivery, etc.) and when
  consent was given/revoked.

## Operational hygiene

- Input validation and file-type validation on every upload.
- Malware scanning on uploaded files before processing.
- Rate limiting at the API gateway.
- Backup + disaster recovery plan for the database and object storage.
- Secure deletion policy for user-requested data removal.

## Safety-layer boundary (product-level, not just infra)

This is the non-technical half of "security" for a health product: the
system must never present itself as a diagnostic authority. See
`docs/AI_RAG_PIPELINE.md#safety-layer-mandatory-not-optional` for the
enforced boundary between "report finding," "general medical information,"
and "personalized medical advice."
