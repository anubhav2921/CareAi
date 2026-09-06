from abc import ABC, abstractmethod
from typing import Dict, Any

class MedicalAnalysisService(ABC):
    @abstractmethod
    def analyze(self, structured_data: Dict[str, Any]) -> Dict[str, Any]:
        pass
