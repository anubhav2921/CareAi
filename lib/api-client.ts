const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export type ReportStatus = 'uploaded' | 'queued' | 'processing' | 'completed' | 'failed';
export type Language = 'en' | 'hi' | 'hinglish';

export interface LocalizedString {
  en: string;
  hi: string;
  hinglish: string;
}

export interface PatientInfo {
  name: string | null;
  age: number | null;
  sex: string | null;
  sample_date: string | null;
}

export interface ReportMeta {
  type: string;
  title: string;
}

export interface ReportSummary {
  overview: LocalizedString;
  within_range: number;
  above_range: number;
  below_range: number;
  unknown: number;
}

export interface ReportParameter {
  name: string;
  value: number | null;
  unit: string;
  reference_range: string;
  status: 'within_range' | 'above_range' | 'below_range' | 'unknown';
  explanation: LocalizedString;
}

export interface ReportResult {
  patient: PatientInfo;
  report: ReportMeta;
  summary: ReportSummary;
  parameters: ReportParameter[];
  attention_items: string[];
  doctor_questions: { en: string[]; hi: string[]; hinglish: string[] };
  limitations: string[];
}

export interface Report {
  id: string;
  status: ReportStatus;
  type?: string;
  uploadDate: string;
  processingError?: string;
  progress?: {
    uploaded: boolean;
    identified: boolean;
    extracted: boolean;
    analyzed: boolean;
    explanationGenerated: boolean;
    audioGenerated: boolean;
  };
  result?: ReportResult;
  isGuest?: boolean;
}

export const apiClient = {
  login: async (email: string, password: string) => {
    // Keep mock login for now until auth is implemented
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (email === 'test@example.com' && password === 'password') {
      return { token: 'mock-jwt-token' };
    }
    throw new Error('Invalid credentials');
  },

  uploadReport: async (file: File, guestSessionId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (guestSessionId) {
      formData.append('guest_session_id', guestSessionId);
    }

    let response;
    try {
      response = await fetch(`${API_BASE}/reports/upload`, {
        method: 'POST',
        body: formData,
      });
    } catch (err: unknown) {
      console.error('[Upload] Fetch error:', err);
      throw new Error('Unable to connect to the analysis service. Please make sure the server is running and try again.');
    }

    if (!response.ok) {
      let errorMsg = `Unable to analyze this report right now. Please try again. (Status: ${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData?.detail) {
          if (typeof errorData.detail === 'string') {
            errorMsg = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
             errorMsg = JSON.stringify(errorData.detail);
          } else {
             errorMsg = errorData.detail.message || errorMsg;
          }
        }
      } catch {
        // Not JSON
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return { reportId: data.report_id, status: data.status };
  },

  uploadGuestReport: async (file: File) => {
    const guestSessionId = 'guest_' + Math.random().toString(36).substring(7);
    return apiClient.uploadReport(file, guestSessionId);
  },

  getReportStatus: async (id: string) => {
    const response = await fetch(`${API_BASE}/reports/${id}`);
    if (!response.ok) {
      throw new Error('Failed to get report status');
    }
    return response.json();
  },

  getReportResult: async (id: string): Promise<ReportResult> => {
    const response = await fetch(`${API_BASE}/reports/${id}/result`);
    if (!response.ok) {
      throw new Error('Failed to get report result');
    }
    return response.json();
  },

  getReport: async (id: string): Promise<Report> => {
    const statusData = await apiClient.getReportStatus(id);

    const report: Report = {
      id: statusData.id,
      status: statusData.status as ReportStatus,
      type: statusData.report_type,
      uploadDate: statusData.created_at,
      processingError: statusData.processing_error,
      progress: {
        uploaded: true,
        identified: statusData.status !== 'uploaded' && statusData.status !== 'queued',
        extracted: statusData.status === 'completed',
        analyzed: statusData.status === 'completed',
        explanationGenerated: statusData.status === 'completed',
        audioGenerated: false,
      }
    };

    if (statusData.status === 'completed') {
      try {
        report.result = await apiClient.getReportResult(id);
      } catch (err: unknown) {
        console.error("Could not fetch result for completed report", err);
      }
    }

    return report;
  },

  getGuestReport: async (id: string): Promise<Report> => {
    return apiClient.getReport(id);
  },

  downloadReportPDF: async (id: string) => {
    // Mock for now
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { success: true, url: `/api/mock-download/${id}.pdf` };
  },

  getRecentReports: async (): Promise<Report[]> => {
    return [];
  },
};
