# Phase 1: Report Flow Fix

## 1. Root Cause
The root cause of the "hardcoded default report" issue was twofold:
1. `CBCProcessor` completely bypassed the text extracted from the document and appended a static list of dictionaries (Hemoglobin = 11.2, WBC = 7.5, Platelets = 250) for every single processed report.
2. `MockMedicalAnalysisService` similarly ignored the `structured_data` input provided by the processor and blindly returned the exact same static medical evaluation dictionary. 
This resulted in identical data being saved to `ReportResult` regardless of what document was uploaded, despite the upload, storage, processing, and Postgres database tracking correctly using isolated `report_id` UUIDs.

## 2. Where the Hardcoded Report Originated
- **Processor Layer:** `backend/app/services/processors/cbc.py`
- **AI Service Layer:** `backend/app/services/ai/mock.py`
- **Fallback Extractor:** `backend/app/services/extractor.py` (which returned a hardcoded mock CBC string when an image was uploaded).

## 3. Files Changed
- `backend/app/services/extractor.py`: Removed the fallback mock string. Images now correctly raise a `NotImplementedError` in Phase 1 since OCR is not yet implemented.
- `backend/app/services/processors/cbc.py`: Introduced a regex-based parser that accurately extracts numeric values from the document's textual content dynamically.
- `backend/app/services/ai/mock.py`: Rewrote the mock AI engine to dynamically read the `structured_data` input and deterministically generate appropriate explanations and status flags ("above_range", "below_range", "within_range") based on the actual values found.
- `frontend/app/reports/guest/[id]/page.tsx`: Fixed the "svg" rendering bug affecting icons.

## 4. Whether report_id was being propagated correctly
**Yes.** The frontend appropriately stored and requested the unique `report_id` returned by the upload API. `localStorage` was not caching or confusing reports.

## 5. Whether ReportResult was linked correctly
**Yes.** In PostgreSQL, each `ReportResult` record was correctly linked via its foreign key to the unique `Report` record. The issue was purely that identical data was inserted into each isolated record.

## 6. Whether CBCProcessor was using actual extracted text
**No.** It was using hardcoded variables. It is now fixed and parses text via `re.search`.

## 7. Whether mock AI was using actual structured input
**No.** It was returning static data. It is now fixed to iterate over `structured_data["parameters"]`.

## 8. Two-report isolation test result
Passed.
- **Upload A** (Test PDF A): Returned Hemoglobin 10.5
- **Upload B** (Test PDF B): Returned Hemoglobin 14.2
The isolation is confirmed and deterministic based strictly on the respective PDF contents.

## 9. Frontend test result
Passed. Navigating to the two distinct report URLs correctly retrieves and displays the two distinct datasets extracted by the backend.

## 10. SVG rendering issue and fix
The issue (e.g., "svgReport Summary") was caused by a frontend DOM quirk where inline `svg` tags occasionally bleed their tag name into text nodes during selection or rendering. Fixed by wrapping the Lucide icons in `<span aria-hidden="true" className="shrink-0 flex items-center justify-center">` containers, shielding them from the text nodes.

## 11. Remaining Phase 1 limitations
Since `MockOCRExtractor` was removed, uploading image files (PNG/JPG) will now result in an "Analysis Failed" state in the UI. This is deliberate, as true image OCR will be implemented in Phase 2. Currently, only text-based PDFs will be successfully parsed by `PyPDF2`.
