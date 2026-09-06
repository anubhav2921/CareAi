# Frontend

## Stack

- **Next.js** + TypeScript
- **Tailwind CSS** + shadcn/ui for components
- **React Query** for server state / polling job status
- **Zod** for form + API response validation

## App structure

```
app/
│
├── login/
├── dashboard/
│
├── reports/
│   ├── upload
│   ├── [reportId]          # report detail: explanation, findings, PDF, audio, chat
│   └── history              # timeline across past reports
│
├── analysis/                 # "Ask My Report" chat interface
│
├── doctors/                  # doctor discovery by specialty/location
│
├── hospitals/                # nearest hospitals / clinics
│
├── reminders/
│
├── settings/                 # delivery preferences (email/WhatsApp/push), language
│
└── profile/
```

## Dashboard (example layout)

```
┌─────────────────────────────────────────────┐
│ Hello, {user}                                │
│                                               │
│ Upload Medical Report                        │
│ ┌───────────────────────────────────────────┐│
│ │ Drag & Drop PDF / Image                    ││
│ └───────────────────────────────────────────┘│
│                                               │
│ Recent Reports                               │
│  CBC Report          Aug 28    View          │
│  Thyroid Report      Aug 14    View          │
│  X-Ray               Jul 02    View          │
│                                               │
│ Upcoming Reminders                           │
│  🔔 Follow-up test                            │
└─────────────────────────────────────────────┘
```

## Report detail page — key states

Upload processing is asynchronous, so the report detail page needs a
progress UI while workers run, polled via `GET /reports/{id}` (or a
websocket/SSE channel later):

```
Analyzing your report...

✓ Document uploaded
✓ Report identified
✓ Text extracted
✓ Values analyzed
✓ Explanation generated
● Generating audio...
```

Once `status: completed`, render:

- **Executive summary** — plain-language overview
- **Key findings** — highlighted values outside reference range, each with:
  result, reference range, plain-language meaning, "possible significance"
  (never a diagnosis)
- **Values within reference range** — collapsed/secondary
- **🎧 Listen to your report** — audio player (Hindi / English / Hinglish
  selectable)
- **Ask My Report** — chat box seeded with report context
- **Next steps** — generic, professional-referral-oriented suggestions +
  "questions to ask your doctor"
- **Download PDF** / **Email** / **Send to WhatsApp**
- **Original report** — the source file, always accessible

## "Ask My Report" chat UI

Suggested starter prompts shown as chips:

- "Is anything abnormal?"
- "What does hemoglobin mean?"
- "Explain this like I'm a beginner."
- "What questions should I ask my doctor?"
- "Compare this report with my previous report."

## Report history / timeline

```
Jan 2026 ── CBC ──► Apr 2026 ── CBC ──► Aug 2026 ── CBC
```

Trend callouts, e.g. "Your hemoglobin has decreased across these three
reports. This trend is worth discussing with your healthcare professional."

## i18n / multilingual

Plan for Hindi / English / Hinglish from the start (text UI + audio
generation), with room for more regional languages later — this is called
out as a strong differentiator for an India-focused audience.

## Non-negotiable UI copy rules

Never render AI output as a definitive diagnosis or prescription. Always
frame findings as things to discuss with a healthcare professional. This
mirrors the safety-layer rules in `docs/AI_RAG_PIPELINE.md` — the frontend
should not "upgrade" language that the backend already carefully hedged.
