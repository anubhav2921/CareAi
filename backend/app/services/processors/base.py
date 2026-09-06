from abc import ABC, abstractmethod
from typing import Dict, Any

class ReportProcessor(ABC):
    @abstractmethod
    def process(self, text: str) -> Dict[str, Any]:
        pass
