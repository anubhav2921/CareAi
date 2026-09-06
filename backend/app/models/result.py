import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, JSON, DateTime, ForeignKey, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base

class ReportResult(Base):
    __tablename__ = "report_results"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    report_id = Column(Uuid, ForeignKey("reports.id"), unique=True, nullable=False)
    schema_version = Column(String, nullable=False, default="1.0")
    structured_data = Column(JSON, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
