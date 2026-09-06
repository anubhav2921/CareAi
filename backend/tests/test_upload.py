import pytest
import io

def test_upload_pdf(client, monkeypatch):
    # Mock celery task to avoid actual execution
    class MockTask:
        def delay(self, report_id):
            pass
    monkeypatch.setattr("app.api.endpoints.reports.process_report", MockTask())

    file_content = b"%PDF-1.4 mock pdf content"
    response = client.post(
        "/api/v1/reports/upload",
        files={"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "report_id" in data
    assert data["status"] == "queued"
    assert data["report_type"] == "unknown"

def test_upload_invalid_mime(client):
    file_content = b"fake content"
    response = client.post(
        "/api/v1/reports/upload",
        files={"file": ("test.txt", io.BytesIO(file_content), "text/plain")}
    )
    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "UNSUPPORTED_FILE_TYPE"

def test_get_report_status_not_found(client):
    response = client.get("/api/v1/reports/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
