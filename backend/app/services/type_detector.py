from app.models.report import ReportType

class ReportTypeDetector:
    def detect(self, text: str) -> ReportType:
        text_lower = text.lower()
        cbc_signals = ["cbc", "complete blood count", "hemoglobin", "wbc", "rbc", "platelet"]
        
        # Count how many signals are present
        signal_count = sum(1 for signal in cbc_signals if signal in text_lower)
        
        # Require at least 2 signals to confidently identify as CBC
        if signal_count >= 2:
            return ReportType.cbc
            
        return ReportType.unknown
