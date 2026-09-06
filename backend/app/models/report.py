import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum, Uuid
import enum
from app.core.database import Base

class ReportStatus(str, enum.Enum):
    uploaded = "uploaded"
    queued = "queued"
    processing = "processing"
    completed = "completed"
    failed = "failed"

class ReportType(str, enum.Enum):
    unknown = "unknown"
    cbc = "cbc"

class Report(Base):
    __tablename__ = "reports"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(String, nullable=True, index=True)
    guest_session_id = Column(String, nullable=True, index=True)
    original_filename = Column(String, nullable=False)
    storage_key = Column(String, nullable=False)
    mime_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    
    report_type = Column(Enum(ReportType), default=ReportType.unknown, nullable=False)
    status = Column(Enum(ReportStatus), default=ReportStatus.uploaded, nullable=False)
    processing_error = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=True)
