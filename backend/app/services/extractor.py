import io
from abc import ABC, abstractmethod
import PyPDF2

class DocumentExtractor(ABC):
    @abstractmethod
    def extract_text(self, file_content: bytes, mime_type: str) -> str:
        pass

class PDFExtractor(DocumentExtractor):
    def extract_text(self, file_content: bytes, mime_type: str) -> str:
        if mime_type != "application/pdf":
            raise ValueError(f"PDFExtractor cannot handle {mime_type}")
            
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
                
        if not text.strip():
            raise ValueError("No extractable text found in PDF. This might be an image-only PDF requiring OCR.")
            
        return text

class MockOCRExtractor(DocumentExtractor):
    def extract_text(self, file_content: bytes, mime_type: str) -> str:
        # In Phase 1, real image OCR is not yet implemented.
        # Do not return a mock string that fakes a CBC report.
        raise NotImplementedError("Image OCR is not yet implemented for Phase 1. Please upload a text-based PDF.")
