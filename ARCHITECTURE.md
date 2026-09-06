# Architecture

## High-level system diagram

```
                         ┌──────────────────────────┐
                         │        USER / WEB        │
                         │       Next.js App        │
                         └────────────┬─────────────┘
                                      │ HTTPS / TLS
                         ┌────────────▼─────────────┐
                         │       API GATEWAY        │
                         │   Auth / Rate Limiting   │
                         └────────────┬─────────────┘
                                      │
                    ┌─────────────────┼──────────────────┐
                    ▼                 ▼                  ▼
             ┌────────────┐    ┌─────────────┐    ┌──────────────┐
             │ Auth/User  │    │ Report API  │    │ Notification │
             │ Service    │    │ Service     │    │ Service      │
             └────────────┘    └──────┬──────┘    └──────────────┘
                                      │  Upload / Job Queue
                         ┌────────────▼─────────────┐
                         │      WORKER SYSTEM       │
                         │       Celery / Redis     │
                         └────────────┬─────────────┘
              ┌───────────────────────┼──────────────────────┐
              ▼                       ▼                      ▼
       ┌─────────────┐        ┌──────────────┐       ┌─────────────┐
       │ OCR / Vision│        │ Medical AI   │       │ Audio Gen   │
       │ Pipeline    │        │ Pipeline     │       │ Pipeline    │
       └──────┬──────┘        └──────┬───────┘       └──────┬──────┘
              └──────────────────────┼──────────────────────┘
                                     ▼
                              ┌──────────────┐
                              │ Safety Layer │
                              └──────┬───────┘
                                     ▼
                              ┌──────────────┐
                              │ RAG System   │
                              └──────┬───────┘
                    ┌────────────────┼─────────────────┐
                    ▼                ▼                 ▼
              PostgreSQL        Vector DB (pgvector) Object Storage
              user/report       embeddings           PDF/images/audio
```

## Design principles

1. **Never synchronous for heavy work.** Upload returns immediately with a
   `report_id` and `status: processing`; everything downstream (OCR, LLM,
   PDF, TTS) runs on workers via a queue.
2. **Route by document type, don't send everything to one giant prompt.**
   A classifier decides lab / radiology / prescription / unknown, and each
   type gets its own extraction pipeline.
3. **Every AI explanation passes through the safety layer** before it
   reaches the user — no exceptions, no "just this once."
4. **Ground explanations in retrieved knowledge (RAG)**, not just the LLM's
   internal knowledge, and keep the retrieved sources traceable.
5. **Abstract every external AI provider** (LLM, embeddings, OCR, TTS)
   behind an internal interface so providers can be swapped without
   rewriting the app.
6. **Minimize what's sent to third-party AI APIs.** Strip unnecessary
   patient-identifying data before it leaves your infrastructure where
   possible.

## Report processing pipeline (core flow)

```
Upload
  ↓
Store original file (object storage)
  ↓
Create report record + processing job
  ↓
Return report_id (status: processing) to client
  ↓
[worker] Document classification
  ↓
[worker] OCR / Vision extraction
  ↓
[worker] Structured data extraction + normalization
  ↓
[worker] RAG: retrieve relevant trusted medical context
  ↓
[worker] LLM reasoning → draft explanation
  ↓
[worker] Safety validation layer
  ↓
[worker] Humanized explanation (approved)
  ↓
[worker] Generate PDF + generate audio (parallel)
  ↓
status: completed → notify user (in-app / email / WhatsApp per preference)
```

## Document-type routing

```
                Document
                   ↓
             Classifier
                   ↓
        ┌──────────┼──────────┐
        ↓          ↓          ↓
       LAB      RADIOLOGY   PRESCRIPTION
        ↓          ↓          ↓
    Lab parser   Vision     Medication
    (CBC, LFT,   model      extraction
    KFT, lipid,  (X-ray,
    thyroid...)  US, CT,
                 MRI)
```

## The 5 engines

| Engine | Question it answers | Components |
|---|---|---|
| Understanding | "What's in the report?" | OCR, document classifier, extraction, multimodal AI |
| Knowledge | "What does this generally mean?" | RAG, trusted medical knowledge base, embeddings |
| Safety | "Is this claim appropriately supported?" | Hallucination checks, diagnosis/medication guardrails, uncertainty checks |
| Communication | "How do we explain it to the patient?" | Text explanation, PDF generator, TTS/audio, multilingual output |
| Continuity | "What's next and when?" | Report history, reminders, notifications, doctor/hospital discovery |

See `docs/AI_RAG_PIPELINE.md` for the RAG + safety layer in detail,
`docs/BACKEND.md` for service boundaries, and `docs/DATABASE.md` for schema.
