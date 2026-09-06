import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Activity, ShieldCheck, Search, Bell } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.ico" alt="CareAI Logo" className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight text-blue-900">CareAI</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">How it works</Link>
            <Link href="#safety" className="hover:text-blue-600 transition-colors">Safety</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600">Sign in</Button>
            </Link>
            <Link href="/upload">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              Understand your medical reports, <span className="text-blue-600">simply.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload your medical report and get a clear, easy-to-understand explanation powered by AI. Make informed decisions about your health.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/upload">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg rounded-full">
                  Upload a Report <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-slate-300 text-slate-700 hover:bg-slate-100">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white border-y border-slate-100">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Comprehensive Health Intelligence</h2>
              <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Everything you need to understand and act on your medical data.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: FileText, title: "AI Report Explanation", desc: "Complex medical jargon translated into simple, humanized language." },
                { icon: Activity, title: "Report History", desc: "Track trends and compare results across multiple historical reports." },
                { icon: Search, title: "Find Doctors", desc: "Discover specialized doctors near you based on your report findings." },
                { icon: Bell, title: "Health Reminders", desc: "Automated reminders for follow-up tests and doctor appointments." },
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
                  <feature.icon className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Section */}
        <section id="safety" className="py-20 bg-blue-50/50">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <ShieldCheck className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Your Safety is Our Priority</h2>
            <p className="text-lg text-slate-700 leading-relaxed bg-white p-8 rounded-2xl border border-blue-100 shadow-sm">
              MediAI provides informational explanations designed to help you understand your health data.
              <strong> We do not provide medical diagnoses, prescribe treatments, or replace qualified healthcare professionals. </strong>
              Always consult with your doctor before making any medical decisions.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.ico" alt="CareAI Logo" className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight text-blue-900">CareAI</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} MediAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
