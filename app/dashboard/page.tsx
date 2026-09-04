"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, Report } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, FileText, Bell, ChevronRight, Activity } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const data = await apiClient.getRecentReports();
      setReports(data);
      setLoading(false);
    };
    fetchReports();
  }, []);

  const handleUploadClick = () => {
    router.push("/reports/upload");
  };

  const handleViewReport = (id: string) => {
    router.push(`/reports/${id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12">
      <div className="mx-auto max-w-4xl space-y-8">
        
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hello, User</h1>
            <p className="text-zinc-500">Welcome to your Health AI Platform</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Activity className="h-6 w-6" />
          </div>
        </header>

        <section>
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer" onClick={handleUploadClick}>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-600">
                <FileUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Upload Medical Report</h3>
              <p className="mb-4 mt-2 text-sm text-zinc-500 max-w-sm">
                Drag & drop your PDF or image here, or click to browse files.
              </p>
              <Button>Select File</Button>
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Recent Reports</h2>
            {loading ? (
              <p className="text-sm text-zinc-500">Loading reports...</p>
            ) : reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id} className="hover:border-blue-200 transition-colors cursor-pointer" onClick={() => handleViewReport(report.id)}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="rounded bg-zinc-100 p-2 text-zinc-500">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{report.type || 'Unknown Report'}</p>
                          <p className="text-sm text-zinc-500">
                            {new Date(report.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-zinc-400" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-sm text-zinc-500">
                  No reports found. Upload one to get started.
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Upcoming Reminders</h2>
            <Card>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Follow-up test</p>
                    <p className="text-xs text-zinc-500">In 2 weeks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
