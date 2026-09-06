from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any


class ExplanationDetail(BaseModel):
    """Structured, patient-friendly explanation broken into distinct sections."""
    what_is_this: str = Field(..., description="Plain-language description of what the test measures")
    what_did_report_show: str = Field(..., description="What the actual result means relative to the range")
    what_this_means: str = Field(..., description="Safe, uncertainty-aware interpretation")
    should_i_worry: Optional[str] = Field(None, description="Calm, honest guidance — only for abnormal results")


class StructuredExplanation(BaseModel):
    """Localized structured explanation in three languages."""
    en: ExplanationDetail
    hi: ExplanationDetail
    hinglish: ExplanationDetail


class LocalizedString(BaseModel):
    en: str
    hi: str
    hinglish: str


class AttentionItem(BaseModel):
    """A single finding that warrants attention, ranked by relevance."""
    name: str = Field(..., description="Parameter name")
    status: str = Field(..., description="Status: above_range or below_range")
    value: Optional[float] = Field(None, description="The patient's extracted value")
    unit: str = Field("", description="Unit of measurement")
    reference_range: str = Field("", description="Reference range from the report")


class ParameterResult(BaseModel):
    name: str = Field(..., description="The normalized name of the parameter")
    value: Optional[float] = Field(None, description="The extracted numeric value")
    unit: str = Field(..., description="The unit of measurement")
    reference_range: str = Field(..., description="The reference range stated on the report")
    status: str = Field(..., description="Status: within_range, below_range, above_range, or unknown")
    explanation: StructuredExplanation = Field(..., description="Structured localized explanations")
    confidence: Optional[float] = Field(None, description="Extraction confidence score 0.0–1.0")


class ReportSummary(BaseModel):
    overview: LocalizedString
    within_range: int
    above_range: int
    below_range: int
    unknown: int
    attention_summary: List[AttentionItem] = Field(
        default_factory=list,
        description="Ranked list of top abnormal findings for the 'Things worth discussing' section"
    )


class PatientInfo(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    sample_date: Optional[str] = None


class ReportMeta(BaseModel):
    type: str
    title: str


class DoctorQuestions(BaseModel):
    en: List[str]
    hi: List[str]
    hinglish: List[str]


class AIAnalysisResponse(BaseModel):
    patient: PatientInfo = Field(..., description="Extracted patient metadata")
    report: ReportMeta = Field(..., description="Report type and title")
    summary: ReportSummary = Field(..., description="Overview and counts")
    parameters: List[ParameterResult] = Field(..., description="List of analyzed parameters")
    attention_items: List[str] = Field(..., description="Names of items outside the reference range")
    doctor_questions: DoctorQuestions = Field(..., description="Suggested questions in three languages")
    limitations: List[str] = Field(..., description="Medical safety disclaimers")
