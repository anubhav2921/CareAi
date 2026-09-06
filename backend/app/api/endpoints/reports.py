from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
import uuid
from typing import Optional

from app.core.database import get_db
from app.core.config import settings
from app.models.report import Report, ReportStatus, ReportType
from app.models.result import ReportResult
from app.services.storage.local import LocalStorageService
from app.worker.tasks import process_report
from app.schemas.report import UploadResponse, ReportResponse

router = APIRouter()
storage_service = LocalStorageService()

SUPPORTED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg"]

@router.post("/upload", response_model=UploadResponse)
async def upload_report(
    file: UploadFile = File(...),
    guest_session_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    # Read file content first for size and signature validation
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail={"code": "EMPTY_FILE", "message": "The file is empty."}
        )
        
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail={"code": "FILE_TOO_LARGE", "message": "The file exceeds the maximum allowed size."}
        )

    # Validate MIME type and extension
    content_type = file.content_type.lower() if file.content_type else ""
    filename = file.filename.lower() if file.filename else ""
    
    is_pdf = content_type in ["application/pdf", "application/x-pdf"] or filename.endswith(".pdf")
    is_image = content_type in ["image/png", "image/jpeg", "image/jpg"] or filename.endswith((".png", ".jpg", ".jpeg"))
    
    if not is_pdf and not is_image:
        raise HTTPException(
            status_code=400, 
            detail={"code": "UNSUPPORTED_FILE_TYPE", "message": "This file type is not supported. Please upload a PDF or image."}
        )
        
    # Validate PDF signature to ensure it's not a renamed malicious file
    if is_pdf and not file_content.startswith(b'%PDF-'):
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_PDF", "message": "The file does not appear to be a valid PDF."}
        )

    # Save to storage
    storage_key = f"{uuid.uuid4()}_{file.filename}"
    try:
        storage_service.save(file_content, storage_key)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "STORAGE_ERROR", "message": "Failed to save the file."}
        )

    # Create Report record
    new_report = Report(
        guest_session_id=guest_session_id,
        original_filename=file.filename,
        storage_key=storage_key,
        mime_type=file.content_type,
        file_size=file_size,
        status=ReportStatus.queued
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    # Trigger Celery Task
    try:
        process_report.delay(str(new_report.id))
    except Exception as e:
        db.delete(new_report)
        db.commit()
        storage_service.delete(storage_key)
        raise HTTPException(
            status_code=500,
            detail={"code": "QUEUE_ERROR", "message": "Failed to queue the report for processing."}
        )

    return UploadResponse(
        report_id=new_report.id,
        status=new_report.status,
        report_type=new_report.report_type
    )

@router.get("/{report_id}", response_model=ReportResponse)
def get_report_status(report_id: str, db: Session = Depends(get_db)):
    try:
        report_uuid = uuid.UUID(report_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid report ID format.")

    report = db.query(Report).filter(Report.id == report_uuid).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    return ReportResponse(
        id=report.id,
        status=report.status,
        report_type=report.report_type,
        created_at=report.created_at,
        processing_error=report.processing_error
    )

@router.get("/{report_id}/result")
def get_report_result(report_id: str, db: Session = Depends(get_db)):
    try:
        report_uuid = uuid.UUID(report_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid report ID format.")

    report = db.query(Report).filter(Report.id == report_uuid).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
        
    if report.status != ReportStatus.completed:
        raise HTTPException(status_code=400, detail="Report processing is not completed yet.")

    result = db.query(ReportResult).filter(ReportResult.report_id == report_uuid).first()
    if not result:
        raise HTTPException(status_code=404, detail="Report result not found.")

    return result.structured_data
