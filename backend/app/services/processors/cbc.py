import re
from typing import Dict, Any
from .base import ReportProcessor

class CBCProcessor(ReportProcessor):
    def process(self, text: str) -> Dict[str, Any]:
        parameters = []
        
        # Simple regex for parameters
        def extract_value(keyword: str, text: str) -> float | None:
            pattern = re.compile(rf"{keyword}.*?(\d+\.\d+|\d+)", re.IGNORECASE)
            match = pattern.search(text)
            if match:
                return float(match.group(1))
            return None

        # Simple regex for patient info
        def extract_string(keyword: str, text: str) -> str | None:
            # Matches Name: John Doe or Patient Name: John Doe
            pattern = re.compile(rf"{keyword}\s*[:\-]?\s*([a-zA-Z0-9\s]+?)(?=\n|$)", re.IGNORECASE)
            match = pattern.search(text)
            if match:
                val = match.group(1).strip()
                return val if val else None
            return None

        clean_text = " ".join(text.replace('\n', ' ').split())

        # Extract parameters
        hb_val = extract_value("Hemoglobin", clean_text)
        if hb_val is not None:
            parameters.append({
                "name": "Hemoglobin",
                "original_name": "Hemoglobin (Hb)",
                "value": hb_val,
                "unit": "g/dL",
                "reference_range": "12.0 - 15.5",
                "confidence": 0.85
            })

        wbc_val = extract_value("White Blood", clean_text) or extract_value("WBC", clean_text)
        if wbc_val is not None:
            parameters.append({
                "name": "White Blood Cells",
                "original_name": "White Blood Cells",
                "value": wbc_val,
                "unit": "x10^9/L",
                "reference_range": "4.5 - 11.0",
                "confidence": 0.85
            })

        plt_val = extract_value("Platelet", clean_text)
        if plt_val is not None:
            parameters.append({
                "name": "Platelets",
                "original_name": "Platelets",
                "value": plt_val,
                "unit": "x10^9/L",
                "reference_range": "150 - 450",
                "confidence": 0.85
            })
            
        # Extract metadata (from raw text with newlines for better anchor matching)
        patient_name = extract_string(r"(?:Patient\s*Name|Name)", text)
        patient_age = extract_value(r"Age", clean_text)
        patient_sex = extract_string(r"(?:Sex|Gender)", text)
        sample_date = extract_string(r"(?:Sample Date|Date|Collected)", text)
                    
        return {
            "patient": {
                "name": patient_name,
                "age": int(patient_age) if patient_age is not None else None,
                "sex": patient_sex,
                "sample_date": sample_date
            },
            "report": {
                "type": "cbc",
                "title": "Complete Blood Count"
            },
            "parameters": parameters
        }
