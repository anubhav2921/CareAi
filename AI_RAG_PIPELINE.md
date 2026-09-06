# AI / RAG Pipeline

## `ai/` module layout

```
ai/
│
├── document_classifier/
├── ocr/
├── extraction/
├── normalization/
├── medical_reasoning/
├── rag/
├── safety/
├── report_generation/
└── audio_generation/
```

Each is independently swappable behind a provider interface (see
`docs/BACKEND.md#provider-abstraction`).

## End-to-end pipeline

```
Medical Report
      ↓
Document Classification
      ↓
OCR / Vision
      ↓
Information Extraction
      ↓
Structured Medical Data
      ↓
Reference-range interpretation
      ↓
Clinical reasoning layer
      ↓
Safety / uncertainty checks
      ↓
Humanized explanation
```

## Type-specific sub-pipelines

**Lab report** (CBC, LFT, KFT, lipid, thyroid, urine, ...)
```
PDF/Image → OCR → Extract biomarkers → Normalize units →
Compare with report-specific reference ranges → Explain
```

**Radiology** (X-ray, ultrasound, CT, MRI)
```
Image → Medical vision model → Image findings →
Uncertainty assessment → Explain findings/terminology
```

**Prescription**
```
Prescription → OCR → Medicine identification →
Dosage/timing extraction → Human-readable explanation
```

## RAG architecture

Don't do `PDF → LLM → answer`. Ground every explanation in retrieved,
trusted context:

```
                 REPORT
                    │
                    ▼
             Extract Findings
                    │
                    ▼
              Query Builder
                    │
                    ▼
              Vector Search (pgvector)
                    │
          ┌─────────┴─────────┐
          │                   │
      Guidelines         Medical Knowledge
          │                   │
          └─────────┬─────────┘
                    ▼
              Context Builder
                    │
                    ▼
                  LLM
                    │
                    ▼
             Safety Validator
                    │
                    ▼
               Final Answer
```

Knowledge sources should be **curated and authoritative** (government
health agencies, major medical institutions, peer-reviewed literature,
clinical guidelines, laboratory-specific reference ranges) and versioned
(see `docs/DATABASE.md#rag-source-versioning`).

The model must distinguish between three separate things and never blur
them together:
1. **Report finding** — what the document literally says
2. **General medical information** — what that kind of finding generally means
3. **Personalized medical advice** — kept limited and always safety-checked

## Safety layer (mandatory, not optional)

Every AI-generated explanation flows through this before reaching the user:

```
                AI Generated Answer
                         ↓
                ┌─────────────────┐
                │  Safety Engine  │
                └────────┬────────┘
                         ↓
            ┌────────────┼────────────┐
            ↓            ↓            ↓
       Hallucination   Diagnosis   Medication
          checks        checks       checks
            ↓            ↓            ↓
            └────────────┼────────────┘
                         ↓
                  Approved Response
```

Implement deterministic checks + model-based evaluation. Reject or flag
outputs containing unsupported statements such as:

- "You definitely have..."
- "Take X mg..."
- "Stop your medication..."

unless the system is explicitly designed and clinically validated for that
level of functionality (a much higher bar than the MVP described here).

Other checks the safety engine should cover: unsupported diagnoses,
dangerous certainty, missing context, contradictions, emergency-warning
signs that should escalate rather than be softened, hallucinated values,
and incorrect reference ranges.

## Report generation (PDF)

Kept as its own service, not bundled into the LLM call:

```
analysis result → Report Renderer → HTML/template → PDF → S3
```

Suggested PDF sections:
1. Report overview
2. Key findings
3. Values outside reference ranges
4. What the terms mean
5. Important observations
6. Questions for your doctor
7. Suggested follow-up discussion
8. Safety notice
9. Original report reference

## Audio generation

```
Analysis → Generate audio script → TTS → MP3 → S3 → User
```

Support Hindi / English / Hinglish first; add more regional languages
later.

## Example output shape (CBC)

```
🧾 Your Report, Explained

Overall interpretation:
Your CBC shows that most measured values are within the laboratory's
reference ranges. A few values may need attention...

Hemoglobin
Result: 11.2 g/dL
Reference range: X–Y
What it means: Hemoglobin relates to the blood's oxygen-carrying capacity.
Your result: Below the listed reference range.
Possible significance: Can be associated with several conditions, but this
result alone cannot determine the cause.

What should you do?
- Discuss the result with a qualified healthcare professional.
- Bring the original report to the appointment.
- Don't start medication based only on the AI explanation.
```

This is the standard the safety layer should enforce everywhere — never
collapse "below reference range" into a bare diagnostic claim.
