# CareAI Language Support

## Current Languages

| Code       | Display name | Script   | Status     |
|------------|-------------|----------|------------|
| `en`       | English     | Latin    | ✅ Complete |
| `hi`       | हिन्दी       | Devanagari | ✅ Complete |
| `hinglish` | Hinglish    | Latin    | ✅ Complete |

---

## Architecture

### Three-tier translation

```
Static UI strings:         frontend/locales/{en,hi,hinglish}.json
                              ↓ loaded by i18n context
Dynamic medical text:      backend/app/services/ai/mock.py
                              ↓ returned as JSON
                           { "en": "...", "hi": "...", "hinglish": "..." }
                              ↓ selected by language at render time
                           param.explanation[language]
```

**Why not translate on the frontend?**

Medical text is dynamic — it depends on the actual extracted values and reference ranges. Translating "Your hemoglobin is 10.5 g/dL, which is below 12.0" reliably at the frontend would require a real translation model. Instead, the backend pre-generates all three language variants deterministically.

### i18n Context

`frontend/lib/i18n-context.tsx` provides:

- `language: Language` — current language (`'en' | 'hi' | 'hinglish'`)
- `setLanguage(lang)` — changes language and persists to `localStorage` (key: `careai_lang`)
- `t(key)` — resolves a dotted path (e.g. `t('report.title')`) against the current locale JSON

**Language persistence:** the language preference is stored in `localStorage` under the key `careai_lang`. Medical report content is never stored in localStorage.

**Instant switching:** changing language does not require a page reload or API call. The backend already sent all three language variants in the same JSON payload.

### What switches instantly

- All static UI labels (section headings, button labels, badges, status labels)
- Medical explanation paragraphs
- Doctor questions
- Summary overview text
- Patient-info field labels

### What does NOT change during translation

- Numerical values (e.g. `10.5`)
- Units (e.g. `g/dL`, `x10⁹/L`)
- Reference ranges (e.g. `12.0 - 15.5`)
- Patient name, age, sex, sample date

---

## Hinglish Guidelines

Hinglish is **not** a mechanical transliteration of Hindi. It follows how educated Indians naturally switch between Hindi and English in conversation.

### Principles

1. Use Hindi sentence structure and common Hindi vocabulary.
2. Keep medical terms in English (they are universally understood): `hemoglobin`, `WBC`, `platelet`, `CBC`, `blood test`, `reference range`.
3. Use simple conversational connectors: `aur`, `lekin`, `iska matlab`, `isliye`, `jo`, `ki`, `se`.
4. Avoid rare or formal Hindi words that would not appear in casual speech.

### Examples

**Too literal (bad):**
> "Aapka hemoglobin ka star niyantrit seema se neeche hai."

**Good Hinglish:**
> "Aapka hemoglobin report mein di gayi range se kam hai."

---

## Hindi Guidelines

Hindi should be:
- **Natural** — avoid overly Sanskritized terms where simpler alternatives exist.
- **Patient-facing** — the reader is a layperson, not a medical professional.

### Examples

| Avoid                        | Use                          |
|------------------------------|------------------------------|
| रक्त कोशिकाएँ               | red blood cells / खून की कोशिकाएँ |
| संदर्भ अंतराल                | रिपोर्ट में दी गई सीमा        |
| निदान                        | (describe what the test shows, don't use the word for "diagnosis") |

---

## Adding a New Language

Follow these steps to add a new language (e.g. Bengali `bn`):

### Step 1 — Add the locale JSON

Create `frontend/locales/bn.json` by copying `en.json` and translating each value.

Keys should not be changed. Only the values should be translated.

### Step 2 — Update the type

In `frontend/lib/i18n-context.tsx`:

```ts
export type Language = 'en' | 'hi' | 'hinglish' | 'bn';
```

Add the new locale import:
```ts
import bn from '../locales/bn.json';
const translations = { en, hi, hinglish, bn };
```

### Step 3 — Update the language selector

In `frontend/app/reports/guest/[id]/page.tsx`:

```ts
const LANG_LABELS: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  hinglish: 'Hinglish',
  bn: 'বাংলা',         // add this
};
```

### Step 4 — Add backend translations

In `backend/app/services/ai/mock.py`, add `"bn"` to every `explanation`, `what_is_this`, `what_did_report_show`, `what_this_means`, `should_i_worry`, `doctor_questions`, and `overview` dict.

Example:
```python
"what_is_this": {
    "en": "Hemoglobin is a protein...",
    "hi": "Hemoglobin aapke red blood cells mein...",
    "hinglish": "Hemoglobin ek protein hota hai...",
    "bn": "হিমোগ্লোবিন একটি প্রোটিন..."   # add this
},
```

### Step 5 — Update the schema

In `backend/app/schemas/ai.py`, the `LocalizedString` model accepts any string dict values, so no change is needed unless you want to enforce `bn` as a required field.

### Step 6 — Test

1. Verify all keys in `bn.json` match `en.json`.
2. Run `npm run typecheck` to catch type errors.
3. Run `npm run lint` to check for issues.
4. Upload a test PDF, switch to the new language, and verify all static UI text and medical explanations switch correctly.
5. Verify that numerical values, units, and reference ranges are unchanged.

---

## Testing Language Switching

The following scenarios must pass manually after any change to the language system:

| Scenario | Expected |
|---|---|
| Select English | All UI text and explanations in English |
| Select हिन्दी | All UI text and explanations in Hindi |
| Select Hinglish | All UI text and explanations in Hinglish |
| Refresh after selecting Hindi | Hindi remains selected |
| Switch language while report is open | Instant switch, no reload |
| Numbers during switch | 10.5, g/dL, 12.0–15.5 unchanged |
| Patient info during switch | Name, age, sex unchanged |
| Missing patient field during switch | "Not shown in report" (in correct language) |
| No report result | Error state uses correct language |

---

## Privacy

The only patient-adjacent value stored client-side is:

```
localStorage key: careai_lang
Values: "en" | "hi" | "hinglish"
```

This stores only a language preference. Medical report data is never stored in localStorage, cookies, or query parameters.
