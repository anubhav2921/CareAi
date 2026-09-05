"use client";

import { useEffect, useState, use } from "react";
import { apiClient, Report, ReportParameter, Language } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import {
  Loader2, Download, Share2, BookmarkPlus, Play, MessageSquare,
  AlertTriangle, CheckCircle2, Activity, FileText, ChevronRight,
  FileQuestion, ChevronDown, ChevronUp, Info, Globe
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Status helpers ─────────────────────────────────────────────────────────

type ParamStatus = ReportParameter['status'];

function getStatusLabel(status: ParamStatus, t: (k: string) => string): string {
  switch (status) {
    case 'within_range': return t('report.within_range');
    case 'above_range': return t('report.higher_than_range');
    case 'below_range': return t('report.lower_than_range');
    default: return t('report.could_not_determine');
  }
}

function StatusBadge({ status, t }: { status: ParamStatus; t: (k: string) => string }) {
  const label = getStatusLabel(status, t);
  if (status === 'within_range') {
    return (
      <span
        role="status"
        aria-label={label}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200"
      >
        <CheckCircle2 aria-hidden="true" className="h-3 w-3 shrink-0" />
        {label}
      </span>
    );
  }
  if (status === 'above_range' || status === 'below_range') {
    return (
      <span
        role="status"
        aria-label={label}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
      >
        <AlertTriangle aria-hidden="true" className="h-3 w-3 shrink-0" />
        {label}
      </span>
    );
  }
  return (
    <span
      role="status"
      aria-label={label}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200"
    >
      {label}
    </span>
  );
}

// ─── Progress step ───────────────────────────────────────────────────────────

function ProgressStep({ label, active, completed }: { label: string; active: boolean; completed: boolean }) {
  return (
    <div className={`flex items-center gap-4 transition-opacity ${active ? 'opacity-100' : 'opacity-35'}`} role="listitem">
      <div
        aria-hidden="true"
        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
          completed ? 'bg-green-500 border-green-500 text-white' :
          active ? 'border-blue-500 text-blue-500' :
          'border-slate-200'
        }`}
      >
        {completed
          ? <CheckCircle2 className="h-4.5 w-4.5" strokeWidth={2.5} />
          : <div className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
        }
      </div>
      <span className={`text-sm font-medium ${completed ? 'text-slate-900' : active ? 'text-blue-700' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
}

// ─── Parameter detail card ───────────────────────────────────────────────────

function ParameterCard({
  param,
  lang,
  defaultExpanded = false
}: {
  param: ReportParameter;
  lang: Language;
  defaultExpanded?: boolean;
}) {
  const [open, setOpen] = useState(defaultExpanded);
  const { t } = useI18n();

  const isAbnormal = param.status === 'above_range' || param.status === 'below_range';

  // Explanation paragraphs — the backend returns them separated by \n\n
  const rawExplanation = param.explanation?.[lang] ?? param.explanation?.en ?? '';
  const paragraphs = rawExplanation.split('\n\n').filter(Boolean);

  const detailsBtnId = `details-btn-${param.name.replace(/\s+/g, '-')}`;
  const detailsContentId = `details-content-${param.name.replace(/\s+/g, '-')}`;

  return (
    <article
      aria-label={param.name}
      className={`rounded-2xl border overflow-hidden transition-shadow hover:shadow-sm ${
        isAbnormal
          ? 'border-amber-200 bg-amber-50/40'
          : 'border-slate-200 bg-white'
      }`}
    >
      {/* Card header row */}
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-base leading-tight mb-2">
            {param.name}
          </h3>
          <StatusBadge status={param.status} t={t} />
        </div>

        <div className="text-right shrink-0 ml-4">
          <div className={`text-2xl font-bold tabular-nums ${isAbnormal ? 'text-amber-700' : 'text-slate-800'}`}>
            {param.value ?? '—'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{param.unit}</div>
        </div>
      </div>

      {/* Range row */}
      <div className={`px-5 pb-4 flex items-center gap-2 text-xs ${isAbnormal ? 'text-amber-800/70' : 'text-slate-500'}`}>
        <span className="font-medium">{t('report.range_on_report')}:</span>
        <span className="font-mono">{param.reference_range || '—'}</span>
      </div>

      {/* Expandable explanation */}
      {paragraphs.length > 0 && (
        <div className={`border-t ${isAbnormal ? 'border-amber-200/60' : 'border-slate-100'}`}>
          <button
            id={detailsBtnId}
            aria-expanded={open}
            aria-controls={detailsContentId}
            onClick={() => setOpen(v => !v)}
            className={`w-full flex items-center justify-between gap-2 px-5 py-3 text-xs font-semibold transition-colors ${
              isAbnormal
                ? 'text-amber-700 hover:text-amber-900 hover:bg-amber-50'
                : 'text-blue-600 hover:text-blue-800 hover:bg-slate-50'
            }`}
          >
            <span>{open ? t('report.hide_details') : t('report.show_details')}</span>
            {open
              ? <ChevronUp aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              : <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            }
          </button>

          {open && (
            <div
              id={detailsContentId}
              role="region"
              aria-labelledby={detailsBtnId}
              className={`px-5 pb-5 space-y-3 text-sm leading-relaxed ${isAbnormal ? 'text-amber-900/80' : 'text-slate-700'}`}
            >
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// ─── Language selector ───────────────────────────────────────────────────────

const LANG_LABELS: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  hinglish: 'Hinglish'
};

function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('report.language')}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
      >
        <Globe aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="hidden sm:block">{LANG_LABELS[language]}</span>
        <ChevronDown aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          {/* Dropdown */}
          <ul
            role="listbox"
            aria-label={t('report.language')}
            className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50"
          >
            {(Object.entries(LANG_LABELS) as [Language, string][]).map(([code, label]) => (
              <li key={code} role="option" aria-selected={language === code}>
                <button
                  onClick={() => handleSelect(code)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors rounded-lg mx-auto ${
                    language === code
                      ? 'text-blue-700 font-semibold bg-blue-50'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GuestReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [normalOpen, setNormalOpen] = useState(false);
  const { requireAuth } = useAuth();
  const { language, t } = useI18n();

  useEffect(() => {
    let intervalRef: ReturnType<typeof setInterval> | null = null;

    const run = async () => {
      try {
        const data = await apiClient.getGuestReport(resolvedParams.id);
        setReport(data);

        if (['processing', 'uploaded', 'queued'].includes(data.status)) {
          intervalRef = setInterval(async () => {
            try {
              const updated = await apiClient.getGuestReport(resolvedParams.id);
              setReport(updated);
              if (!['processing', 'uploaded', 'queued'].includes(updated.status)) {
                if (intervalRef) clearInterval(intervalRef);
              }
            } catch {
              if (intervalRef) clearInterval(intervalRef);
              setFetchError('Failed to fetch report updates');
            }
          }, 2500);
        }
      } catch {
        setFetchError('Failed to fetch report');
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => { if (intervalRef) clearInterval(intervalRef); };
  }, [resolvedParams.id]);

  const handleDownload = () => requireAuth("download", () => alert("Downloading PDF... (simulated)"));
  const handleShare = () => requireAuth("share", () => alert("Opening share modal... (simulated)"));
  const handleSave = () => requireAuth("save", () => alert("Report saved to your account! (simulated)"));

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6" role="status" aria-live="polite" aria-label={t('report.connecting')}>
        <Loader2 aria-hidden="true" className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-600 font-medium">{t('report.connecting')}</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (fetchError || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div aria-hidden="true" className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <FileQuestion className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('report.analysis_unavailable')}</h1>
        <p className="text-slate-500 mb-8 max-w-md text-sm leading-relaxed">
          {fetchError || t('report.analysis_unavailable_desc')}
        </p>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-full" onClick={() => router.push("/upload")}>
          {t('report.upload_new')}
        </Button>
      </div>
    );
  }

  // ── Failed processing ────────────────────────────────────────────────────
  if (report.status === 'failed') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div aria-hidden="true" className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('report.analysis_failed')}</h1>
        <p className="text-slate-500 mb-8 max-w-md text-sm leading-relaxed">
          {report.processingError || t('report.analysis_failed_desc')}
        </p>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-full" onClick={() => router.push("/upload")}>
          {t('report.try_another')}
        </Button>
      </div>
    );
  }

  // ── Processing ───────────────────────────────────────────────────────────
  if (['processing', 'uploaded', 'queued'].includes(report.status)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
          <div aria-hidden="true" className="relative w-20 h-20 mx-auto mb-7">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="h-7 w-7 text-blue-600" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">{t('report.analyzing')}</h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">{t('report.analyzing_desc')}</p>
          <div className="space-y-4 text-left" role="list" aria-label="Analysis progress">
            <ProgressStep label={t('report.reading')} active completed={report.progress?.identified ?? false} />
            <ProgressStep label={t('report.identifying')} active={report.progress?.identified ?? false} completed={report.progress?.extracted ?? false} />
            <ProgressStep label={t('report.finding')} active={report.progress?.extracted ?? false} completed={report.progress?.analyzed ?? false} />
            <ProgressStep label={t('report.preparing')} active={report.progress?.analyzed ?? false} completed={report.progress?.explanationGenerated ?? false} />
          </div>
        </div>
      </div>
    );
  }

  // ── Completed ────────────────────────────────────────────────────────────
  const result = report.result;
  const patient = result?.patient;
  const reportMeta = result?.report;
  const summary = result?.summary;
  const parameters = result?.parameters ?? [];
  const doctorQuestions = result?.doctor_questions?.[language] ?? result?.doctor_questions?.en ?? [];
  const limitations = result?.limitations ?? [];
  const overviewText = summary?.overview?.[language] ?? summary?.overview?.en ?? '';

  const abnormalParams = parameters.filter(p => p.status === 'above_range' || p.status === 'below_range');
  const normalParams = parameters.filter(p => p.status === 'within_range');

  const hasPatientInfo = patient && (patient.name || patient.age != null || patient.sex || patient.sample_date);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 h-15 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <Activity aria-hidden="true" className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-bold tracking-tight text-blue-900 hidden sm:block">CareAI</span>
          </Link>

          <div className="flex items-center gap-2 md:gap-2.5">
            <LanguageSelector />

            <Button variant="ghost" size="sm" className="hidden lg:flex text-slate-600 gap-1.5" onClick={() => alert("Playing audio... (simulated)")}>
              <Play aria-hidden="true" className="h-4 w-4" />
              {t('report.listen')}
            </Button>
            <Button variant="ghost" size="sm" className="hidden lg:flex text-slate-600 gap-1.5" onClick={() => alert("Opening chat... (simulated)")}>
              <MessageSquare aria-hidden="true" className="h-4 w-4" />
              {t('report.ask_ai')}
            </Button>
            <Button variant="outline" size="sm" className="text-slate-600 border-slate-200 gap-1.5" onClick={handleShare}>
              <Share2 aria-hidden="true" className="h-4 w-4" />
              <span className="hidden md:inline">{t('report.share')}</span>
            </Button>
            <Button variant="outline" size="sm" className="text-slate-600 border-slate-200 gap-1.5" onClick={handleDownload}>
              <Download aria-hidden="true" className="h-4 w-4" />
              <span className="hidden md:inline">{t('report.download')}</span>
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1.5" onClick={handleSave}>
              <BookmarkPlus aria-hidden="true" className="h-4 w-4" />
              <span className="hidden md:inline">{t('report.save')}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl pb-20">

        {/* ── Page title ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">{t('report.title')}</h1>
          {reportMeta?.title && (
            <p className="text-slate-500 text-sm">{t('report.report_type_label')}: {reportMeta.title}</p>
          )}
        </div>

        <div className="space-y-5">

          {/* 1. Patient information */}
          {hasPatientInfo && (
            <section aria-labelledby="patient-heading" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 id="patient-heading" className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                {t('report.patient_info')}
              </h2>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
                {[
                  { label: t('report.patient'), value: patient?.name },
                  {
                    label: t('report.age'),
                    value: patient?.age != null ? `${patient.age} ${t('report.years')}` : null
                  },
                  { label: t('report.sex'), value: patient?.sex },
                  { label: t('report.sample_date'), value: patient?.sample_date },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs font-medium text-slate-400 mb-0.5">{label}</dt>
                    <dd className="text-sm font-semibold text-slate-800">
                      {value ?? <span className="text-slate-400 font-normal italic text-xs">{t('report.not_available')}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* 2. Summary — plain language */}
          {summary && overviewText && (
            <section
              aria-labelledby="summary-heading"
              className="bg-blue-600 rounded-2xl p-6 shadow-sm text-white"
            >
              <h2 id="summary-heading" className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-3">
                {t('report.report_summary_heading')}
              </h2>
              <p className="text-base md:text-lg font-medium text-blue-50 leading-relaxed">
                {overviewText}
              </p>
            </section>
          )}

          {/* 3. What is a CBC? */}
          {reportMeta?.type === 'cbc' && (
            <section aria-labelledby="cbc-heading" className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
              <h2 id="cbc-heading" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Info aria-hidden="true" className="h-4 w-4 text-slate-400 shrink-0" />
                {t('report.what_is_cbc')}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">{t('report.cbc_explanation')}</p>
            </section>
          )}

          {/* 4. Results that need attention */}
          {abnormalParams.length > 0 && (
            <section aria-labelledby="attention-heading">
              <h2 id="attention-heading" className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-3">
                <AlertTriangle aria-hidden="true" className="h-5 w-5 text-amber-500 shrink-0" />
                {t('report.needs_attention_heading')}
              </h2>
              <div className="space-y-3">
                {abnormalParams.map((param, idx) => (
                  <ParameterCard key={`abnormal-${idx}`} param={param} lang={language} defaultExpanded />
                ))}
              </div>
            </section>
          )}

          {/* 5. Results within the range (collapsible) */}
          {normalParams.length > 0 && (
            <section aria-labelledby="normal-toggle">
              <button
                id="normal-toggle"
                aria-expanded={normalOpen}
                aria-controls="normal-results-list"
                onClick={() => setNormalOpen(v => !v)}
                className="w-full flex items-center justify-between gap-3 text-left group mb-3"
              >
                <span className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-green-500 shrink-0" />
                  {t('report.normal_results_heading')}
                  <span className="text-sm font-normal text-slate-400 ml-1">({normalParams.length})</span>
                </span>
                {normalOpen
                  ? <ChevronUp aria-hidden="true" className="h-5 w-5 text-slate-400 shrink-0 group-hover:text-slate-600" />
                  : <ChevronDown aria-hidden="true" className="h-5 w-5 text-slate-400 shrink-0 group-hover:text-slate-600" />
                }
              </button>

              {normalOpen && (
                <div id="normal-results-list" className="space-y-3">
                  <p className="text-sm text-slate-500 mb-3">{t('report.normal_results_desc')}</p>
                  {normalParams.map((param, idx) => (
                    <ParameterCard key={`normal-${idx}`} param={param} lang={language} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Empty state */}
          {parameters.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <p className="text-slate-500 text-sm">{t('report.no_results')}</p>
            </div>
          )}

          {/* 6. Questions for the doctor */}
          {doctorQuestions.length > 0 && (
            <section
              aria-labelledby="questions-heading"
              className="bg-blue-50 rounded-2xl border border-blue-100 p-5 md:p-6"
            >
              <h2 id="questions-heading" className="flex items-center gap-2 text-base font-bold text-blue-900 mb-4">
                <MessageSquare aria-hidden="true" className="h-5 w-5 text-blue-500 shrink-0" />
                {t('report.questions_heading')}
              </h2>
              <ul className="space-y-3" role="list">
                {doctorQuestions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                    <ChevronRight aria-hidden="true" className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    {q}
                  </li>
                ))}
                <li className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                  <ChevronRight aria-hidden="true" className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  {t('report.questions_extra')}
                </li>
              </ul>
            </section>
          )}

          {/* 7. Disclaimer */}
          {limitations.length > 0 && (
            <aside
              aria-label={t('report.disclaimer_heading')}
              className="bg-slate-100 rounded-2xl border border-slate-200 p-5 space-y-2"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('report.disclaimer_heading')}
              </p>
              {limitations.map((lim, idx) => (
                <p key={idx} className="text-xs text-slate-600 leading-relaxed">{lim}</p>
              ))}
            </aside>
          )}

        </div>
      </main>
    </div>
  );
}
