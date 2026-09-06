from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from app.models.report import ReportStatus, ReportType

class UploadResponse(BaseModel):
    report_id: UUID
    status: ReportStatus
    report_type: ReportType

class ReportResponse(BaseModel):
    id: UUID
    status: ReportStatus
    report_type: ReportType
    created_at: datetime
    processing_error: Optional[str] = None
