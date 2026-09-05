"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Loader2, X } from "lucide-react";

export default function GuestUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const processUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    
    try {
      const response = await apiClient.uploadGuestReport(file);
      router.push(`/reports/guest/${response.reportId}`);
    } catch (err) {
      setError("Failed to upload report. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex items-center justify-center">
      <Card className="w-full max-w-2xl border-slate-200 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-slate-900">Upload your medical report</CardTitle>
          <CardDescription className="text-slate-500">
            PDF, JPG or PNG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-6 py-16 transition-all hover:bg-blue-50">
            {loading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-sm font-semibold text-slate-900">Uploading report...</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-slate-200 w-full max-w-sm justify-between">
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium text-slate-900 truncate">{file.name}</span>
                    <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="text-slate-400 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-full" onClick={processUpload}>
                  Analyze Report
                </Button>
              </div>
            ) : (
              <>
                <FileUp className="mx-auto h-16 w-16 text-blue-300 mb-6" aria-hidden="true" />
                <div className="flex text-sm leading-6 text-slate-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-blue-600 focus-within:outline-none hover:text-blue-500 hover:underline"
                  >
                    <span>Click to browse</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,image/png,image/jpeg" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
              </>
            )}
          </div>
          {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
          <div className="mt-8 flex justify-center">
            <Button variant="ghost" onClick={() => router.push("/")} disabled={loading} className="text-slate-500">
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
