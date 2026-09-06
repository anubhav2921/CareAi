import pytest
from app.services.processors.cbc import CBCProcessor
from app.services.type_detector import ReportTypeDetector
from app.models.report import ReportType
from app.services.ai.mock import MockMedicalAnalysisService


def test_cbc_detector_positive():
    detector = ReportTypeDetector()
    text = "This is a Complete Blood Count. It shows Hemoglobin levels."
    assert detector.detect(text) == ReportType.cbc


def test_cbc_detector_negative():
    detector = ReportTypeDetector()
    text = "This is just a random medical document without specific signals."
    assert detector.detect(text) == ReportType.unknown


def test_cbc_processor_parsing():
    processor = CBCProcessor()
    text = """
    COMPLETE BLOOD COUNT (CBC)
    Hemoglobin (Hb) 11.2 g/dL (12.0 - 15.5)
    White Blood Cells 7.5 x10^9/L (4.5 - 11.0)
    Platelets 250 x10^9/L (150 - 450)
    """
    result = processor.process(text)
    assert result["report"]["type"] == "cbc"
    assert len(result["parameters"]) == 3

    hb = next((p for p in result["parameters"] if p["name"] == "Hemoglobin"), None)
    assert hb is not None
    assert hb["value"] == 11.2
    assert hb["unit"] == "g/dL"
    assert hb["reference_range"] == "12.0 - 15.5"


def test_cbc_processor_patient_metadata():
    processor = CBCProcessor()
    text = """
    Patient Name: John Doe
    Age: 35
    Sex: Male
    Sample Date: 05 Sep 2026
    COMPLETE BLOOD COUNT (CBC)
    Hemoglobin (Hb) 13.5 g/dL
    """
    result = processor.process(text)
    assert result["patient"]["name"] == "John Doe"
    assert result["patient"]["age"] == 35
    assert result["patient"]["sex"] == "Male"


def test_cbc_processor_missing_patient_metadata():
    processor = CBCProcessor()
    text = """
    COMPLETE BLOOD COUNT (CBC)
    Hemoglobin (Hb) 13.5 g/dL
    """
    result = processor.process(text)
    assert result["patient"]["name"] is None
    assert result["patient"]["age"] is None
    assert result["patient"]["sex"] is None


def test_cbc_processor_no_hardcoded_values():
    """Uploading different content must produce different values."""
    processor = CBCProcessor()
    text_a = "Hemoglobin 10.5 g/dL\nWhite Blood Cells 6.0\nPlatelets 200"
    text_b = "Hemoglobin 14.2 g/dL\nWhite Blood Cells 8.1\nPlatelets 320"

    result_a = processor.process(text_a)
    result_b = processor.process(text_b)

    hb_a = next(p["value"] for p in result_a["parameters"] if p["name"] == "Hemoglobin")
    hb_b = next(p["value"] for p in result_b["parameters"] if p["name"] == "Hemoglobin")
    assert hb_a != hb_b
    assert hb_a == 10.5
    assert hb_b == 14.2


def test_mock_ai_multilanguage_response():
    """AI response must include en, hi, and hinglish explanation keys."""
    processor = CBCProcessor()
    ai = MockMedicalAnalysisService()
    text = "Hemoglobin 10.5 g/dL\nWhite Blood Cells 6.0\nPlatelets 200"

    structured_data = processor.process(text)
    ai_result = ai.analyze(structured_data)

    assert "parameters" in ai_result
    for param in ai_result["parameters"]:
        assert "explanation" in param
        assert "en" in param["explanation"]
        assert "hi" in param["explanation"]
        assert "hinglish" in param["explanation"]


def test_mock_ai_below_range_sets_status():
    processor = CBCProcessor()
    ai = MockMedicalAnalysisService()
    text = "Hemoglobin 10.5 g/dL"

    structured_data = processor.process(text)
    ai_result = ai.analyze(structured_data)

    hb_param = next(p for p in ai_result["parameters"] if "Hemoglobin" in p["name"])
    assert hb_param["status"] == "below_range"


def test_mock_ai_within_range_sets_status():
    processor = CBCProcessor()
    ai = MockMedicalAnalysisService()
    text = "Hemoglobin 13.5 g/dL"

    structured_data = processor.process(text)
    ai_result = ai.analyze(structured_data)

    hb_param = next(p for p in ai_result["parameters"] if "Hemoglobin" in p["name"])
    assert hb_param["status"] == "within_range"


def test_mock_ai_summary_counts():
    processor = CBCProcessor()
    ai = MockMedicalAnalysisService()
    # One below range (Hemoglobin), two normal
    text = "Hemoglobin 10.5 g/dL\nWhite Blood Cells 6.0\nPlatelets 200"

    structured_data = processor.process(text)
    ai_result = ai.analyze(structured_data)

    summary = ai_result["summary"]
    assert summary["below_range"] == 1
    assert summary["within_range"] == 2
    assert summary["above_range"] == 0


def test_mock_ai_empty_input():
    ai = MockMedicalAnalysisService()
    result = ai.analyze({"parameters": []})
    assert result["parameters"] == []
    assert "overview" in result["summary"]
    assert "en" in result["summary"]["overview"]


def test_mock_ai_doctor_questions_present():
    processor = CBCProcessor()
    ai = MockMedicalAnalysisService()
    text = "Hemoglobin 10.5 g/dL"

    structured_data = processor.process(text)
    result = ai.analyze(structured_data)

    assert len(result["doctor_questions"]["en"]) > 0
    assert len(result["doctor_questions"]["hi"]) > 0
    assert len(result["doctor_questions"]["hinglish"]) > 0


def test_mock_ai_explanation_is_patient_friendly():
    """Explanations should NOT contain jargon like 'elevated' or 'clinical'.
    The explanation is now a structured dict with sub-sections.
    """
    processor = CBCProcessor()
    ai = MockMedicalAnalysisService()
    text = "Hemoglobin 10.5 g/dL"

    structured_data = processor.process(text)
    result = ai.analyze(structured_data)

    hb_param = next(p for p in result["parameters"] if "Hemoglobin" in p["name"])
    en_expl = hb_param["explanation"]["en"]  # now a dict, not a string
    # Concatenate all sub-sections for content checks
    en_explanation = " ".join(v for v in en_expl.values() if v).lower()

    # Should NOT use raw jargon labels as standalone terms
    assert "out of range" not in en_explanation
    assert "clinical significance" not in en_explanation

    # SHOULD use plain-language description
    assert "oxygen" in en_explanation or "blood" in en_explanation


def test_mock_ai_explanation_has_multiple_paragraphs():
    """Abnormal parameters should have multiple explanation sub-sections.
    The explanation is now a structured dict with distinct named sections
    (what_is_this, what_did_report_show, what_this_means, should_i_worry).
    """
    processor = CBCProcessor()
    ai = MockMedicalAnalysisService()
    text = "Hemoglobin 10.5 g/dL"

    structured_data = processor.process(text)
    result = ai.analyze(structured_data)

    hb_param = next(p for p in result["parameters"] if "Hemoglobin" in p["name"])
    en_expl = hb_param["explanation"]["en"]  # structured dict

    # Verify the structured dict has at least 2 non-empty sections
    filled_sections = [v for v in en_expl.values() if v and v.strip()]
    assert len(filled_sections) >= 2, (
        "Abnormal parameters should have at least 2 filled explanation sections. "
        f"Got: {list(en_expl.keys())}"
    )


def test_mock_ai_overview_is_natural_language():
    """Overview should be a full sentence, not a counter label."""
    processor = CBCProcessor()
    ai = MockMedicalAnalysisService()
    text = "Hemoglobin 10.5 g/dL\nPlatelets 200"

    structured_data = processor.process(text)
    result = ai.analyze(structured_data)

    overview_en = result["summary"]["overview"]["en"]
    # Should be a full sentence ending with punctuation
    assert overview_en.endswith("."), "Overview should end with a period"
    # Should not be a bare count like "1 normal, 1 abnormal"
    assert len(overview_en) > 30, "Overview should be a full sentence, not a bare count"


def test_mock_ai_natural_language_overview_all_normal():
    processor = CBCProcessor()
    ai = MockMedicalAnalysisService()
    text = "Hemoglobin 13.5 g/dL\nWhite Blood Cells 6.0\nPlatelets 200"

    structured_data = processor.process(text)
    result = ai.analyze(structured_data)

    overview_hi = result["summary"]["overview"]["hi"]
    overview_hinglish = result["summary"]["overview"]["hinglish"]
    assert len(overview_hi) > 10
    assert len(overview_hinglish) > 10


def test_mock_ai_limitations_in_result():
    """Limitations should always be present."""
    processor = CBCProcessor()
    ai = MockMedicalAnalysisService()
    text = "Hemoglobin 13.5 g/dL"

    structured_data = processor.process(text)
    result = ai.analyze(structured_data)

    assert len(result["limitations"]) >= 1
