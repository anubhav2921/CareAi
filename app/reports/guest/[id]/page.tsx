"use client";

import { useEffect, useState, use } from "react";
import { apiClient, Report } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Share2, BookmarkPlus, Play, MessageSquare, AlertTriangle, CheckCircle2, Info, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function GuestReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { requireAuth } = useAuth();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await apiClient.getGuestReport(resolvedParams.id);
        setReport(data);
        
        // If still processing, poll every 2 seconds
        if (data.status === 'processing') {
          const interval = setInterval(async () => {
            const updated = await apiClient.getGuestReport(resolvedParams.id);
            setReport(updated);
            if (updated.status !== 'processing') {
              clearInterval(interval);
            }
          }, 2000);
          return () => clearInterval(interval);
        }
      } catch (err) {
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [resolvedParams.id]);

  const handleDownload = () => {
    requireAuth("download", async () => {
      alert("Downloading PDF... (simulated)");
      // const result = await apiClient.downloadReportPDF(resolvedParams.id);
      // window.open(result.url, '_blank');
    });
  };

  const handleShare = () => {
    requireAuth("share", () => {
      alert("Opening share modal... (simulated)");
    });
  };

  const handleSave = () => {
    requireAuth("save", () => {
      alert("Report saved to your account! (simulated)");
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  if (error || !report) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-600">
      {error || "Report not found"}
    </div>
  );

  if (report.status === 'processing') return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md shadow-sm border-slate-200">
        <CardContent className="pt-8 flex flex-col items-center space-y-6">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-900">Analyzing your report...</h2>
          <div className="w-full space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Uploading document</span>
              {report.progress?.uploaded ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Identifying test type</span>
              {report.progress?.identified ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : (report.progress?.uploaded ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : null)}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Extracting clinical values</span>
              {report.progress?.extracted ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : (report.progress?.identified ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : null)}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Preparing plain-English explanation</span>
              {report.progress?.explanationGenerated ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : (report.progress?.analyzed ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : null)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Actions */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-slate-900">CareAI Analysis</span>
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 hidden sm:inline-flex">Guest Session</Badge>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => alert("Playing audio... (simulated)")}>
              <Play className="h-4 w-4 mr-2" /> Listen
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => alert("Opening chat... (simulated)")}>
              <MessageSquare className="h-4 w-4 mr-2" /> Ask AI
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Download</span>
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
              <BookmarkPlus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Save Report</span>
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        
        {/* Safety Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-900">
            <strong>Informational Purposes Only.</strong> CareAI provides AI-generated explanations to help you understand your medical reports. It does not diagnose conditions or replace advice from a qualified healthcare professional. Always consult your doctor.
          </div>
        </div>

        {/* Overview */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white p-6 md:p-8">
            <Badge className="bg-blue-600/20 text-blue-200 hover:bg-blue-600/30 mb-4 border-none">
              {report.type} Report
            </Badge>
            <h1 className="text-3xl font-bold mb-2">Report Summary</h1>
            <p className="text-slate-300 leading-relaxed max-w-3xl text-lg">
              {report.summary}
            </p>
          </div>
        </Card>

        {/* Findings */}
        <h2 className="text-xl font-bold text-slate-900 mt-10 mb-4 flex items-center gap-2">
          Key Findings
        </h2>
        
        <div className="grid gap-4">
          {report.findings?.map((finding, idx) => (
            <Card key={idx} className={`border-l-4 ${finding.isAbnormal ? 'border-l-amber-500' : 'border-l-green-500'} shadow-sm`}>
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-slate-900">{finding.name}</h3>
                      {finding.isAbnormal && <Badge variant="destructive" className="bg-amber-100 text-amber-800 border-amber-200">Abnormal</Badge>}
                    </div>
                    
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">What this is</span>
                        <p className="text-sm text-slate-700">{finding.meaning}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Significance</span>
                        <p className="text-sm text-slate-700">{finding.significance}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg md:w-48 shrink-0 border border-slate-100">
                    <div className="text-xs text-slate-500 mb-1">Your Result</div>
                    <div className={`text-xl font-bold ${finding.isAbnormal ? 'text-amber-700' : 'text-slate-900'}`}>
                      {finding.result}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Standard Range: <br/>{finding.referenceRange}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Questions for Doctor */}
        <Card className="border-blue-100 bg-blue-50/50 shadow-sm mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
              <Info className="h-5 w-5 text-blue-600" />
              Questions to ask your doctor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              {report.findings?.some(f => f.isAbnormal) ? (
                <>
                  <li>Could you explain what might be causing my slightly abnormal {report.findings.find(f => f.isAbnormal)?.name} level?</li>
                  <li>Do I need any follow-up tests or changes to my diet/lifestyle based on this result?</li>
                </>
              ) : (
                <li>Since my results are normal, when should I schedule my next routine checkup?</li>
              )}
              <li>Is there anything else in these results that I should be aware of?</li>
            </ul>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
