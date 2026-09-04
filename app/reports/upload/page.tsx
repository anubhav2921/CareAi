"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Loader2 } from "lucide-react";

export default function UploadReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processUpload(e.target.files[0]);
    }
  };

  const processUpload = async (file: File) => {
    setLoading(true);
    setError("");
    
    try {
      const response = await apiClient.uploadReport(file);
      router.push(`/reports/${response.reportId}`);
    } catch (err) {
      setError("Failed to upload report. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Upload Medical Report</CardTitle>
          <CardDescription>
            We support PDF, JPG, and PNG files. Your data is encrypted and secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 flex justify-center rounded-lg border border-dashed border-zinc-900/25 px-6 py-20 bg-white hover:bg-zinc-50 transition-colors">
            <div className="text-center">
              {loading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                  <p className="text-sm font-semibold text-zinc-900">Uploading...</p>
                </div>
              ) : (
                <>
                  <FileUp className="mx-auto h-12 w-12 text-zinc-300" aria-hidden="true" />
                  <div className="mt-4 flex text-sm leading-6 text-zinc-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                    >
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,image/png,image/jpeg" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-zinc-600">PDF or Image up to 10MB</p>
                </>
              )}
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
          <div className="mt-8 flex justify-center">
            <Button variant="outline" onClick={() => router.push("/dashboard")} disabled={loading}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
