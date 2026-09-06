from app.services.ai.safety import MedicalSafetyValidator


def _make_valid_output(**overrides):
    """Helper to build a valid AIAnalysisResponse payload."""
    base = {
        "patient": {"name": None, "age": None, "sex": None, "sample_date": None},
        "report": {"type": "cbc", "title": "Complete Blood Count"},
        "summary": {
            "overview": {"en": "Safe summary.", "hi": "Surakshit saaransh.", "hinglish": "Safe summary."},
            "within_range": 0, "above_range": 0, "below_range": 0, "unknown": 0
        },
        "parameters": [],
        "attention_items": [],
        "doctor_questions": {"en": [], "hi": [], "hinglish": []},
        "limitations": ["Not a diagnosis."]
    }
    base.update(overrides)
    return base


def test_safety_validator_safe():
    validator = MedicalSafetyValidator()
    assert validator.validate(_make_valid_output()) is True


def test_safety_validator_unsafe_keyword():
    validator = MedicalSafetyValidator()
    bad = _make_valid_output()
    bad["summary"]["overview"]["en"] = "I can diagnose you with an illness."
    assert validator.validate(bad) is False


def test_safety_validator_missing_schema():
    validator = MedicalSafetyValidator()
    # Missing required fields — should fail Pydantic validation
    assert validator.validate({"summary": "Safe but incomplete."}) is False
