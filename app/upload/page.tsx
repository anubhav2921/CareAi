"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, X, ShieldCheck, ArrowRight, Loader2, FileUp, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function GuestUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError("");
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload report.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navigation - Minimal for focus */}
      <header className="w-full border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.ico" alt="CareAI Logo" className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight text-blue-900">CareAI</span>
          </Link>
          <div className="text-sm font-medium text-slate-500">
            Secure Upload Portal
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Upload your medical report
            </h1>
            <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
              Upload a recent medical report and CareAI will help you understand your results in simple, easy-to-follow language.
            </p>
          </div>

          {/* Upload / Selected Area */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
            {!file ? (
              // Empty State
              <div 
                className={`p-10 flex flex-col items-center justify-center text-center transition-colors ${dragActive ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50/50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                  <UploadCloud className="h-10 w-10 text-blue-500" strokeWidth={1.5} />
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Drop your report here</h3>
                
                <div className="flex items-center gap-2 text-slate-600 mb-6">
                  <span>or</span>
                  <label htmlFor="file-upload" className="cursor-pointer font-medium text-blue-600 hover:text-blue-700 hover:underline">
                    Browse from your device
                  </label>
                  <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,image/png,image/jpeg" />
                </div>
                
                <div className="flex items-center gap-6 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><FileUp className="h-4 w-4" /> PDF, JPG, PNG</span>
                  <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> Up to 10 MB</span>
                </div>
              </div>
            ) : (
              // Selected State
              <div className="p-8 md:p-10 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-8 w-8 text-green-500" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-6">Report ready for analysis</h3>
                
                {/* File Card */}
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl w-full max-w-sm mb-8">
                  <div className="h-12 w-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex flex-col text-left overflow-hidden flex-1">
                    <span className="font-medium text-slate-900 truncate" title={file.name}>{file.name}</span>
                    <span className="text-sm text-slate-500">
                      {file.type.includes('pdf') ? 'PDF Document' : 'Image'} • {file.size < 1024 * 1024 ? (file.size / 1024).toFixed(2) + ' KB' : (file.size / 1024 / 1024).toFixed(2) + ' MB'}
                    </span>
                  </div>
                  <button 
                    onClick={handleRemoveFile} 
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                    disabled={loading}
                    aria-label="Remove file"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
                  <Button 
                    size="lg" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 rounded-xl text-base" 
                    onClick={processUpload}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        Analyze Report
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
                
                {error && <p className="mt-4 text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-lg break-all">{error}</p>}
                
                {!loading && (
                  <button 
                    onClick={handleRemoveFile}
                    className="mt-6 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Choose a different file
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Information */}
          <div className="w-full max-w-3xl flex flex-col md:flex-row gap-8 md:gap-12 text-left">
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Your privacy matters
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Your medical information is sensitive. CareAI is designed to keep your report private and secure. Uploads are encrypted and temporarily processed for analysis.
              </p>
            </div>

            <div className="flex-1 space-y-4">
              <h4 className="text-slate-900 font-semibold text-lg mb-2">What happens next?</h4>
              
              <div className="flex items-start gap-3">
                <div className="bg-slate-100 text-slate-600 font-semibold text-xs h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">Upload</p>
                  <p className="text-sm text-slate-500">Add your medical report securely.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-slate-100 text-slate-600 font-semibold text-xs h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">Analyze</p>
                  <p className="text-sm text-slate-500">CareAI reviews the information and identifies relevant test results.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-slate-100 text-slate-600 font-semibold text-xs h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">Understand</p>
                  <p className="text-sm text-slate-500">Get a simple explanation of the important information in your report.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
