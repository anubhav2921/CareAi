import traceback
from app.worker.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.report import Report, ReportStatus, ReportType
from app.models.result import ReportResult
from app.services.storage.local import LocalStorageService
from app.services.extractor import MockOCRExtractor, PDFExtractor
from app.services.type_detector import ReportTypeDetector
from app.services.processors.cbc import CBCProcessor
from app.services.ai.mock import MockMedicalAnalysisService
from app.services.ai.safety import MedicalSafetyValidator

storage_service = LocalStorageService()
mock_extractor = MockOCRExtractor()
pdf_extractor = PDFExtractor()
type_detector = ReportTypeDetector()
cbc_processor = CBCProcessor()
ai_service = MockMedicalAnalysisService()
safety_validator = MedicalSafetyValidator()

@celery_app.task(name="process_report")
def process_report(report_id: str):
    db = SessionLocal()
    try:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            print(f"Report {report_id} not found.")
            return
            
        if report.status in [ReportStatus.processing, ReportStatus.completed]:
            print(f"Report {report_id} is already in {report.status} state. Skipping.")
            return
            
        report.status = ReportStatus.processing
        db.commit()
        
        # 1. Retrieve file content
        try:
            file_content = storage_service.get(report.storage_key)
        except Exception as e:
            report.status = ReportStatus.failed
            report.processing_error = "Failed to retrieve file from storage."
            db.commit()
            print(str(e))
            return
            
        # 2. Extract Text
        try:
            if report.mime_type == "application/pdf":
                text = pdf_extractor.extract_text(file_content, report.mime_type)
            else:
                text = mock_extractor.extract_text(file_content, report.mime_type)
        except Exception as e:
            report.status = ReportStatus.failed
            report.processing_error = "Failed to extract text from document."
            db.commit()
            print(str(e))
            return
        
        # 3. Detect Type
        report_type = type_detector.detect(text)
        report.report_type = report_type
        db.commit()
        
        if report_type != ReportType.cbc:
            report.status = ReportStatus.failed
            report.processing_error = "Only CBC reports are supported currently."
            db.commit()
            return
            
        # 4. Process CBC
        structured_data = cbc_processor.process(text)
        
        # 5. Analyze with AI
        ai_output = ai_service.analyze(structured_data)
        
        # 6. Safety Validation
        is_safe = safety_validator.validate(ai_output)
        if not is_safe:
            report.status = ReportStatus.failed
            report.processing_error = "AI output failed safety validation."
            db.commit()
            return
            
        # 7. Save Result — ai_output already contains the full unified schema
        # (patient, report, summary, parameters, doctor_questions, limitations)
        report_result = ReportResult(
            report_id=report.id,
            structured_data=ai_output
        )
        db.add(report_result)
        
        # 8. Complete
        report.status = ReportStatus.completed
        db.commit()
        
    except Exception as e:
        db.rollback()
        report = db.query(Report).filter(Report.id == report_id).first()
        if report:
            report.status = ReportStatus.failed
            report.processing_error = "An unexpected processing error occurred."
            db.commit()
        print(f"Error processing report {report_id}: {traceback.format_exc()}")
    finally:
        db.close()
