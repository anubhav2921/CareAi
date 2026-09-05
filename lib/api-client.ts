export type ReportStatus = 'processing' | 'completed' | 'error';

export interface Report {
  id: string;
  status: ReportStatus;
  type?: 'CBC' | 'RADIOLOGY' | 'PRESCRIPTION' | 'UNKNOWN';
  uploadDate: string;
  progress?: {
    uploaded: boolean;
    identified: boolean;
    extracted: boolean;
    analyzed: boolean;
    explanationGenerated: boolean;
    audioGenerated: boolean;
  };
  summary?: string;
  findings?: Array<{
    name: string;
    result: string;
    referenceRange: string;
    meaning: string;
    significance: string;
    isAbnormal: boolean;
  }>;
  isGuest?: boolean;
}

// Mock database
const mockReports: Record<string, Report> = {};

export const apiClient = {
  login: async (email: string, password: string) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (email === 'test@example.com' && password === 'password') {
      return { token: 'mock-jwt-token' };
    }
    throw new Error('Invalid credentials');
  },

  uploadReport: async (_file: File) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const reportId = 'rep_' + Math.random().toString(36).substring(7);
    
    // Initialize mock report
    mockReports[reportId] = {
      id: reportId,
      status: 'processing',
      uploadDate: new Date().toISOString(),
      isGuest: false,
      progress: {
        uploaded: true,
        identified: false,
        extracted: false,
        analyzed: false,
        explanationGenerated: false,
        audioGenerated: false,
      },
    };

    // Simulate async background processing
    apiClient._simulateProcessing(reportId);

    return { reportId, status: 'processing' };
  },

  uploadGuestReport: async (_file: File) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const reportId = 'guest_' + Math.random().toString(36).substring(7);
    
    mockReports[reportId] = {
      id: reportId,
      status: 'processing',
      uploadDate: new Date().toISOString(),
      isGuest: true,
      progress: {
        uploaded: true,
        identified: false,
        extracted: false,
        analyzed: false,
        explanationGenerated: false,
        audioGenerated: false,
      },
    };

    apiClient._simulateProcessing(reportId);
    return { reportId, status: 'processing' };
  },

  getGuestReport: async (id: string): Promise<Report> => {
    return apiClient.getReport(id);
  },

  downloadReportPDF: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Simulate returning a Blob or URL
    return { success: true, url: `/api/mock-download/${id}.pdf` };
  },

  getReport: async (id: string): Promise<Report> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const report = mockReports[id];
    if (!report) throw new Error('Report not found');
    return report;
  },

  getRecentReports: async (): Promise<Report[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return Object.values(mockReports).sort((a, b) => 
      new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
  },

  // Internal helper to simulate the Celery worker pipeline
  _simulateProcessing: async (id: string) => {
    const report = mockReports[id];
    if (!report || !report.progress) return;

    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    await delay(1000);
    report.progress.identified = true;
    report.type = 'CBC';
    
    await delay(1500);
    report.progress.extracted = true;

    await delay(1500);
    report.progress.analyzed = true;

    await delay(2000);
    report.progress.explanationGenerated = true;

    await delay(1500);
    report.progress.audioGenerated = true;
    report.status = 'completed';

    // Populate with mock CBC data
    report.summary = "Your Complete Blood Count (CBC) report indicates most values are within normal limits, suggesting overall good health in those areas. However, there is a slight abnormality in your hemoglobin level which you should discuss with your doctor.";
    report.findings = [
      {
        name: "Hemoglobin",
        result: "11.2 g/dL",
        referenceRange: "12.0 - 15.5 g/dL",
        meaning: "Hemoglobin is the protein in red blood cells that carries oxygen.",
        significance: "Slightly low. This can be associated with fatigue or anemia. Please discuss this finding with your healthcare professional.",
        isAbnormal: true
      },
      {
        name: "White Blood Cells (WBC)",
        result: "7.5 x10^9/L",
        referenceRange: "4.5 - 11.0 x10^9/L",
        meaning: "White blood cells are part of your immune system and help fight infection.",
        significance: "Normal. This indicates a healthy immune response.",
        isAbnormal: false
      },
      {
        name: "Platelets",
        result: "250 x10^9/L",
        referenceRange: "150 - 450 x10^9/L",
        meaning: "Platelets help your blood clot to stop bleeding.",
        significance: "Normal.",
        isAbnormal: false
      }
    ];
  }
};
