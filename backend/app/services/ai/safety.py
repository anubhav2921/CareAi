from typing import Dict, Any
import re
from app.schemas.ai import AIAnalysisResponse
from pydantic import ValidationError

class MedicalSafetyValidator:
    def validate(self, ai_output: Dict[str, Any]) -> bool:
        # 1. Validate structure using Pydantic
        try:
            AIAnalysisResponse(**ai_output)
        except ValidationError:
            return False

        # 2. Check for unsafe keywords using word boundaries to avoid false positives
        # (e.g. "diagnosis" should not match "diagnose")
        # We exclude the 'limitations' field since it legitimately references these terms.
        unsafe_patterns = [
            r"\bdiagnose\b",
            r"\bdiagnosed with\b",
            r"\bprescribe\b",
            r"\bprescription\b",
            r"\btake this medication\b",
            r"\bstop taking\b",
            r"\bproves that\b",
            r"\bconfirms that you have\b",
        ]

        # Build a scan-safe copy excluding the limitations field
        scan_data = {k: v for k, v in ai_output.items() if k != "limitations"}
        output_str = str(scan_data).lower()
        for pattern in unsafe_patterns:
            if re.search(pattern, output_str):
                return False

        return True
