"use client";

import { useEffect, useState, use } from "react";
import {
  apiClient,
  Report,
  ReportParameter,
  Language,
  ExplanationDetail,
  AttentionItem,
} from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import {
  Loader2, Download, Share2, BookmarkPlus, MessageSquare,
  AlertTriangle, CheckCircle2, Activity, FileText, ChevronRight,
  FileQuestion, ChevronDown, ChevronUp, Info, Globe, Circle,
  HelpCircle, ClipboardList, Stethoscope, BookOpen, Shield,
  TrendingDown, TrendingUp, Minus, Sparkles, Search
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

type ParamStatus = ReportParameter["status"];

// ─── Status helpers ───────────────────────────────────────────────────────────

function getStatusConfig(status: ParamStatus, t: (k: string) => string) {
  switch (status) {
    case "within_range":
      return {
        label: t("report.within_range"),
        color: "green",
        bgClass: "bg-emerald-50 border-emerald-200",
        textClass: "text-emerald-700",
        badgeBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
        iconClass: "text-emerald-500",
      };
    case "below_range":
      return {
        label: t("report.lower_than_range"),
        color: "amber",
        bgClass: "bg-amber-50 border-amber-200",
        textClass: "text-amber-700",
        badgeBg: "bg-amber-100 text-amber-700 border-amber-200",
        icon: TrendingDown,
        iconClass: "text-amber-500",
      };
    case "above_range":
      return {
        label: t("report.higher_than_range"),
        color: "amber",
        bgClass: "bg-amber-50 border-amber-200",
        textClass: "text-amber-700",
        badgeBg: "bg-amber-100 text-amber-700 border-amber-200",
        icon: TrendingUp,
        iconClass: "text-amber-500",
      };
    default:
      return {
        label: t("report.could_not_determine"),
        color: "slate",
        bgClass: "bg-slate-50 border-slate-200",
        textClass: "text-slate-500",
        badgeBg: "bg-slate-100 text-slate-500 border-slate-200",
        icon: HelpCircle,
        iconClass: "text-slate-400",
      };
  }
}

function StatusBadge({
  status,
  t,
  size = "sm",
}: {
  status: ParamStatus;
  t: (k: string) => string;
  size?: "sm" | "md";
}) {
  const cfg = getStatusConfig(status, t);
  const Icon = cfg.icon;
  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-1 text-xs gap-1"
      : "px-3 py-1.5 text-sm gap-1.5";
  return (
    <span
      role="status"
      aria-label={cfg.label}
      className={`inline-flex items-center rounded-full font-semibold border ${sizeClasses} ${cfg.badgeBg}`}
    >
      <Icon aria-hidden="true" className={`${size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} shrink-0`} />
      {cfg.label}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  value,
  label,
  color,
}: {
  value: number | string;
  label: string;
  color: "blue" | "green" | "amber" | "slate";
}) {
  const colors = {
    blue: "text-blue-700 bg-blue-50 border-blue-100",
    green: "text-emerald-700 bg-emerald-50 border-emerald-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
    slate: "text-slate-500 bg-slate-50 border-slate-100",
  };
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border px-4 py-4 min-w-0 ${colors[color]}`}
    >
      <span className="text-3xl font-bold tabular-nums leading-none mb-1">
        {value}
      </span>
      <span className="text-xs font-medium text-center leading-tight opacity-80">
        {label}
      </span>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  id,
  heading,
  icon: Icon,
  children,
  className = "",
}: {
  id?: string;
  heading: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm ${className}`}
    >
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="h-4.5 w-4.5 text-slate-400 shrink-0"
          />
        )}
        <h2
          id={id}
          className="text-xs font-bold uppercase tracking-wider text-slate-500"
        >
          {heading}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

// ─── Explanation sub-section ──────────────────────────────────────────────────

function ExplanationSubSection({
  heading,
  text,
  icon: Icon,
  accent = false,
}: {
  heading: string;
  text: string;
  icon?: React.ElementType;
  accent?: boolean;
}) {
  if (!text) return null;
  return (
    <div
      className={`rounded-xl p-4 ${accent ? "bg-amber-50/60 border border-amber-100" : "bg-slate-50 border border-slate-100"}`}
    >
      <div className="flex items-center gap-2 mb-2">
        {Icon && (
          <Icon
            aria-hidden="true"
            className={`h-3.5 w-3.5 shrink-0 ${accent ? "text-amber-500" : "text-blue-400"}`}
          />
        )}
        <span
          className={`text-xs font-bold uppercase tracking-wider ${accent ? "text-amber-700" : "text-slate-500"}`}
        >
          {heading}
        </span>
      </div>
      <p
        className={`text-sm leading-relaxed ${accent ? "text-amber-900/80" : "text-slate-700"}`}
      >
        {text}
      </p>
    </div>
  );
}

// ─── Parameter detail card ────────────────────────────────────────────────────

function ParameterCard({
  param,
  lang,
  defaultExpanded = false,
}: {
  param: ReportParameter;
  lang: Language;
  defaultExpanded?: boolean;
}) {
  const [open, setOpen] = useState(defaultExpanded);
  const [simpleOpen, setSimpleOpen] = useState(false);
  const { t } = useI18n();

  const isAbnormal =
    param.status === "above_range" || param.status === "below_range";
  const cfg = getStatusConfig(param.status, t);
  const Icon = cfg.icon;

  // Get the structured explanation for the current language, fall back to EN
  const rawExpl = param.explanation?.[lang] ?? param.explanation?.en;
  const explanation: ExplanationDetail | null = rawExpl ?? null;

  const cardId = `param-${param.name.replace(/\s+/g, "-").toLowerCase()}`;
  const contentId = `${cardId}-content`;

  return (
    <article
      aria-label={param.name}
      className={`rounded-2xl border overflow-hidden transition-shadow hover:shadow-sm ${cfg.bgClass}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Icon
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 ${cfg.iconClass}`}
            />
            <h3 className="font-bold text-slate-900 text-base leading-tight">
              {param.name}
            </h3>
          </div>
          <StatusBadge status={param.status} t={t} />
        </div>

        <div className="text-right shrink-0 ml-2">
          <div
            className={`text-2xl font-bold tabular-nums ${isAbnormal ? cfg.textClass : "text-slate-800"}`}
          >
            {param.value ?? "—"}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{param.unit}</div>
        </div>
      </div>

      {/* Reference range */}
      <div
        className={`px-5 pb-4 flex items-center gap-2 text-xs border-t ${isAbnormal ? "border-amber-100 text-amber-800/60" : "border-slate-100 text-slate-400"}`}
      >
        <span className="font-semibold">{t("report.range_on_report")}:</span>
        <span className="font-mono">{param.reference_range || "—"}</span>
      </div>

      {/* Expandable explanation */}
      {explanation && (
        <div
          className={`border-t ${isAbnormal ? "border-amber-200/40" : "border-slate-100"}`}
        >
          <button
            id={cardId}
            aria-expanded={open}
            aria-controls={contentId}
            onClick={() => setOpen((v) => !v)}
            className={`w-full flex items-center justify-between gap-2 px-5 py-3 text-xs font-semibold transition-colors ${
              isAbnormal
                ? "text-amber-700 hover:bg-amber-50"
                : "text-blue-600 hover:bg-slate-50"
            }`}
          >
            <span>{open ? t("report.hide_details") : t("report.show_details")}</span>
            {open ? (
              <ChevronUp aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            )}
          </button>

          {open && (
            <div
              id={contentId}
              role="region"
              aria-labelledby={cardId}
              className="px-5 pb-5 space-y-3"
            >
              <ExplanationSubSection
                heading={t("report.what_is_this")}
                text={explanation.what_is_this}
                icon={Info}
              />
              <ExplanationSubSection
                heading={t("report.what_did_report_show")}
                text={explanation.what_did_report_show}
                icon={Search}
              />
              <ExplanationSubSection
                heading={t("report.what_this_means")}
                text={explanation.what_this_means}
                icon={Stethoscope}
                accent={isAbnormal}
              />
              {explanation.should_i_worry && (
                <ExplanationSubSection
                  heading={t("report.should_i_worry")}
                  text={explanation.should_i_worry}
                  icon={ClipboardList}
                />
              )}

              {/* Explain simply toggle — for abnormal results only */}
              {isAbnormal && explanation.what_is_this && (
                <div className="pt-1">
                  <button
                    onClick={() => setSimpleOpen((v) => !v)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                  >
                    <Sparkles aria-hidden="true" className="h-3 w-3 shrink-0" />
                    {simpleOpen
                      ? t("report.hide_simple")
                      : t("report.explain_simply")}
                  </button>
                  {simpleOpen && (
                    <div className="mt-2 rounded-xl bg-blue-50 border border-blue-100 p-4">
                      <p className="text-sm text-blue-900 leading-relaxed">
                        {/* Simplified version: first sentence of what_is_this + what it showed */}
                        {explanation.what_is_this.split(". ")[0]}.{" "}
                        {explanation.what_did_report_show}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// ─── All results table row ────────────────────────────────────────────────────

function ResultsTableRow({
  param,
  lang,
}: {
  param: ReportParameter;
  lang: Language;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const cfg = getStatusConfig(param.status, t);
  const Icon = cfg.icon;
  const rawExpl = param.explanation?.[lang] ?? param.explanation?.en;

  return (
    <>
      <tr
        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${open ? "bg-slate-50" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <td className="py-3 px-4">
          <span className="font-medium text-slate-800 text-sm">{param.name}</span>
        </td>
        <td className="py-3 px-4 text-right">
          <span className="font-semibold tabular-nums text-sm text-slate-900">
            {param.value ?? "—"}
          </span>
          {param.unit && (
            <span className="text-xs text-slate-400 ml-1">{param.unit}</span>
          )}
        </td>
        <td className="py-3 px-4 text-sm text-slate-500 font-mono text-right hidden sm:table-cell">
          {param.reference_range || "—"}
        </td>
        <td className="py-3 px-4 text-right">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.badgeBg}`}
          >
            <Icon aria-hidden="true" className="h-2.5 w-2.5 shrink-0" />
            <span className="hidden sm:inline">{cfg.label}</span>
          </span>
        </td>
        <td className="py-3 px-4 text-right w-8">
          {open ? (
            <ChevronUp className="h-4 w-4 text-slate-400 ml-auto" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400 ml-auto" />
          )}
        </td>
      </tr>
      {open && rawExpl && (
        <tr className="bg-slate-50">
          <td colSpan={5} className="px-4 py-4">
            <div className="space-y-2.5 max-w-2xl">
              {rawExpl.what_is_this && (
                <p className="text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-500 text-xs uppercase tracking-wide block mb-0.5">
                    {t("report.what_is_this")}
                  </span>
                  {rawExpl.what_is_this}
                </p>
              )}
              {rawExpl.what_this_means && (
                <p className="text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-500 text-xs uppercase tracking-wide block mb-0.5">
                    {t("report.what_this_means")}
                  </span>
                  {rawExpl.what_this_means}
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Confidence indicator ─────────────────────────────────────────────────────

function ConfidenceDot({ confidence }: { confidence: number | null | undefined }) {
  if (confidence == null) return <Circle className="h-3 w-3 text-slate-300" />;
  if (confidence >= 0.8)
    return <Circle className="h-3 w-3 fill-emerald-400 text-emerald-400" />;
  if (confidence >= 0.5)
    return <Circle className="h-3 w-3 fill-amber-400 text-amber-400" />;
  return <Circle className="h-3 w-3 fill-red-400 text-red-400" />;
}

function ConfidenceLabel({
  confidence,
  t,
}: {
  confidence: number | null | undefined;
  t: (k: string) => string;
}) {
  if (confidence == null) return <span className="text-slate-400">—</span>;
  if (confidence >= 0.8)
    return (
      <span className="text-emerald-700 text-xs">
        {t("report.confidence_high")}
      </span>
    );
  if (confidence >= 0.5)
    return (
      <span className="text-amber-700 text-xs">
        {t("report.confidence_medium")}
      </span>
    );
  return (
    <span className="text-red-700 text-xs">{t("report.confidence_low")}</span>
  );
}

// ─── Pattern analysis ─────────────────────────────────────────────────────────

function PatternAnalysis({
  parameters,
  lang,
  t,
}: {
  parameters: ReportParameter[];
  lang: Language;
  t: (k: string) => string;
}) {
  const abnormal = parameters.filter(
    (p) => p.status === "above_range" || p.status === "below_range"
  );
  if (abnormal.length < 2) return null;

  // Check if multiple CBC red-cell metrics are abnormal together
  const redCellNames = ["hemoglobin", "hematocrit", "rbc", "mcv", "mch", "mchc", "rdw"];
  const abnormalRedCell = abnormal.filter((p) =>
    redCellNames.some((rn) => p.name.toLowerCase().includes(rn))
  );

  if (abnormalRedCell.length < 2) return null;

  const nameList = abnormalRedCell.map((p) => p.name).join(", ");

  const messages: Record<Language, string> = {
    en: `${nameList} — these results are related to each other and may be worth considering together rather than independently. Your doctor will interpret them alongside your symptoms and medical history. This may sometimes be associated with changes in red blood cell function, but a healthcare professional is needed to determine the actual cause.`,
    hi: `${nameList} — ये परिणाम आपस में जुड़े हुए हैं और इन्हें अलग-अलग की बजाय मिलकर देखना ज़्यादा उचित हो सकता है। आपके डॉक्टर इन्हें आपके लक्षणों और चिकित्सीय इतिहास के साथ समझेंगे।`,
    hinglish: `${nameList} — yeh results aapas mein jude hue hain aur inhe alag-alag ki jagah milkar dekhna zyada sahi ho sakta hai. Aapke doctor inhe aapke symptoms aur medical history ke saath samjhenge.`,
  };

  return (
    <Section
      id="pattern-heading"
      heading={t("report.pattern_heading")}
      icon={Activity}
    >
      <p className="text-sm text-slate-500 mb-3 leading-relaxed">
        {t("report.pattern_cbc_intro")}
      </p>
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
        <p className="text-sm text-blue-900 leading-relaxed">
          {messages[lang]}
        </p>
      </div>
    </Section>
  );
}

// ─── Language selector ────────────────────────────────────────────────────────

const LANG_LABELS: Record<Language, string> = {
  en: "English",
  hi: "हिन्दी",
  hinglish: "Hinglish",
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
        aria-label={t("report.language")}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
      >
        <Globe aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="hidden sm:block">{LANG_LABELS[language]}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <ul
            role="listbox"
            aria-label={t("report.language")}
            className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50"
          >
            {(Object.entries(LANG_LABELS) as [Language, string][]).map(
              ([code, label]) => (
                <li key={code} role="option" aria-selected={language === code}>
                  <button
                    onClick={() => handleSelect(code)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors rounded-lg mx-auto ${
                      language === code
                        ? "text-blue-700 font-semibold bg-blue-50"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                </li>
              )
            )}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── Progress step ────────────────────────────────────────────────────────────

function ProgressStep({
  label,
  active,
  completed,
}: {
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 transition-opacity ${active ? "opacity-100" : "opacity-35"}`}
      role="listitem"
    >
      <div
        aria-hidden="true"
        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
          completed
            ? "bg-green-500 border-green-500 text-white"
            : active
              ? "border-blue-500 text-blue-500"
              : "border-slate-200"
        }`}
      >
        {completed ? (
          <CheckCircle2 className="h-4.5 w-4.5" strokeWidth={2.5} />
        ) : (
          <div
            className={`h-2.5 w-2.5 rounded-full ${active ? "bg-blue-500 animate-pulse" : "bg-slate-300"}`}
          />
        )}
      </div>
      <span
        className={`text-sm font-medium ${completed ? "text-slate-900" : active ? "text-blue-700" : "text-slate-400"}`}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GuestReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [normalOpen, setNormalOpen] = useState(false);
  const [symptomText, setSymptomText] = useState("");
  const { requireAuth } = useAuth();
  const { language, t } = useI18n();

  useEffect(() => {
    let intervalRef: ReturnType<typeof setInterval> | null = null;

    const run = async () => {
      try {
        const data = await apiClient.getGuestReport(resolvedParams.id);
        setReport(data);

        if (["processing", "uploaded", "queued"].includes(data.status)) {
          intervalRef = setInterval(async () => {
            try {
              const updated = await apiClient.getGuestReport(resolvedParams.id);
              setReport(updated);
              if (!["processing", "uploaded", "queued"].includes(updated.status)) {
                if (intervalRef) clearInterval(intervalRef);
              }
            } catch {
              if (intervalRef) clearInterval(intervalRef);
              setFetchError("Failed to fetch report updates");
            }
          }, 2500);
        }
      } catch {
        setFetchError("Failed to fetch report");
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => {
      if (intervalRef) clearInterval(intervalRef);
    };
  }, [resolvedParams.id]);

  const handleDownload = () =>
    requireAuth("download", () => alert("Downloading PDF... (simulated)"));
  const handleShare = () =>
    requireAuth("share", () => alert("Opening share modal... (simulated)"));
  const handleSave = () =>
    requireAuth("save", () =>
      alert("Report saved to your account! (simulated)")
    );

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6"
        role="status"
        aria-live="polite"
        aria-label={t("report.connecting")}
      >
        <Loader2
          aria-hidden="true"
          className="h-10 w-10 animate-spin text-blue-600 mb-4"
        />
        <p className="text-slate-600 font-medium">{t("report.connecting")}</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (fetchError || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div
          aria-hidden="true"
          className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6"
        >
          <FileQuestion className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {t("report.analysis_unavailable")}
        </h1>
        <p className="text-slate-500 mb-8 max-w-md text-sm leading-relaxed">
          {fetchError || t("report.analysis_unavailable_desc")}
        </p>
        <Button
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-full"
          onClick={() => router.push("/upload")}
        >
          {t("report.upload_new")}
        </Button>
      </div>
    );
  }

  // ── Failed processing ────────────────────────────────────────────────────
  if (report.status === "failed") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div
          aria-hidden="true"
          className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6"
        >
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {t("report.analysis_failed")}
        </h1>
        <p className="text-slate-500 mb-8 max-w-md text-sm leading-relaxed">
          {report.processingError || t("report.analysis_failed_desc")}
        </p>
        <Button
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-full"
          onClick={() => router.push("/upload")}
        >
          {t("report.try_another")}
        </Button>
      </div>
    );
  }

  // ── Processing ───────────────────────────────────────────────────────────
  if (["processing", "uploaded", "queued"].includes(report.status)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
          <div
            aria-hidden="true"
            className="relative w-20 h-20 mx-auto mb-7"
          >
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="h-7 w-7 text-blue-600" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            {t("report.analyzing")}
          </h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            {t("report.analyzing_desc")}
          </p>
          <div
            className="space-y-4 text-left"
            role="list"
            aria-label="Analysis progress"
          >
            <ProgressStep
              label={t("report.reading")}
              active
              completed={report.progress?.identified ?? false}
            />
            <ProgressStep
              label={t("report.identifying")}
              active={report.progress?.identified ?? false}
              completed={report.progress?.extracted ?? false}
            />
            <ProgressStep
              label={t("report.finding")}
              active={report.progress?.extracted ?? false}
              completed={report.progress?.analyzed ?? false}
            />
            <ProgressStep
              label={t("report.preparing")}
              active={report.progress?.analyzed ?? false}
              completed={report.progress?.explanationGenerated ?? false}
            />
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
  const doctorQuestions =
    result?.doctor_questions?.[language] ??
    result?.doctor_questions?.en ??
    [];
  const limitations = result?.limitations ?? [];
  const overviewText =
    summary?.overview?.[language] ?? summary?.overview?.en ?? "";
  const attentionSummary: AttentionItem[] = summary?.attention_summary ?? [];

  const abnormalParams = parameters.filter(
    (p) => p.status === "above_range" || p.status === "below_range"
  );
  const normalParams = parameters.filter((p) => p.status === "within_range");

  const hasPatientInfo =
    patient &&
    (patient.name || patient.age != null || patient.sex || patient.sample_date);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 h-15 py-3 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
          >
            <Activity aria-hidden="true" className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-bold tracking-tight text-blue-900 hidden sm:block">
              CareAI
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-2.5">
            <LanguageSelector />
            <Button
              variant="outline"
              size="sm"
              className="text-slate-600 border-slate-200 gap-1.5"
              onClick={handleShare}
            >
              <Share2 aria-hidden="true" className="h-4 w-4" />
              <span className="hidden md:inline">{t("report.share")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-slate-600 border-slate-200 gap-1.5"
              onClick={handleDownload}
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              <span className="hidden md:inline">{t("report.download")}</span>
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 gap-1.5"
              onClick={handleSave}
            >
              <BookmarkPlus aria-hidden="true" className="h-4 w-4" />
              <span className="hidden md:inline">{t("report.save")}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl pb-24">

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 1. REPORT READY BANNER                                             */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t("report.title")}
            </h1>
          </div>
          {reportMeta?.title && (
            <p className="text-slate-500 text-sm ml-7">
              {t("report.report_type_label")}: {reportMeta.title}
            </p>
          )}
          <p className="text-slate-400 text-xs ml-7 mt-0.5">
            {t("report.date_analyzed_label")}: {today}
          </p>

          {/* Stat cards */}
          {summary && (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                value={parameters.length}
                label={t("report.tests_analyzed_label")}
                color="blue"
              />
              <StatCard
                value={summary.within_range}
                label={t("report.within_range_count")}
                color="green"
              />
              <StatCard
                value={summary.above_range + summary.below_range}
                label={t("report.needs_attention_count")}
                color={summary.above_range + summary.below_range > 0 ? "amber" : "green"}
              />
              {summary.unknown > 0 && (
                <StatCard
                  value={summary.unknown}
                  label={t("report.unknown_count")}
                  color="slate"
                />
              )}
            </div>
          )}
        </div>

        <div className="space-y-5">

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* 2. PATIENT INFORMATION                                             */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {hasPatientInfo && (
            <Section
              id="patient-heading"
              heading={t("report.patient_info")}
              icon={ClipboardList}
            >
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5">
                {[
                  { label: t("report.patient"), value: patient?.name },
                  {
                    label: t("report.age"),
                    value:
                      patient?.age != null
                        ? `${patient.age} ${t("report.years")}`
                        : null,
                  },
                  { label: t("report.sex"), value: patient?.sex },
                  {
                    label: t("report.sample_date"),
                    value: patient?.sample_date,
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      {label}
                    </dt>
                    <dd className="text-sm font-semibold text-slate-800">
                      {value ?? (
                        <span className="text-slate-400 font-normal italic text-xs">
                          {t("report.not_available")}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* 3. PLAIN-LANGUAGE SUMMARY                                          */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {summary && overviewText && (
            <section
              aria-labelledby="summary-heading"
              className="bg-blue-600 rounded-2xl p-6 shadow-sm text-white"
            >
              <h2
                id="summary-heading"
                className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-3"
              >
                {t("report.report_summary_heading")}
              </h2>
              <p className="text-base md:text-lg font-medium text-blue-50 leading-relaxed">
                {overviewText}
              </p>
            </section>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* 4. KEY FINDINGS — Things worth discussing                          */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <Section
            id="key-findings-heading"
            heading={t("report.key_findings_heading")}
            icon={Stethoscope}
          >
            {attentionSummary.length > 0 ? (
              <>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  {t("report.key_findings_desc")}
                </p>
                <ol className="space-y-3">
                  {attentionSummary.map((item, idx) => {
                    const cfg = getStatusConfig(item.status as ParamStatus, t);
                    const Icon = cfg.icon;
                    return (
                      <li
                        key={idx}
                        className={`flex items-center gap-3 rounded-xl border p-4 ${cfg.bgClass}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${cfg.badgeBg}`}
                        >
                          {idx + 1}
                        </span>
                        <Icon
                          aria-hidden="true"
                          className={`h-4 w-4 shrink-0 ${cfg.iconClass}`}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-slate-900 text-sm">
                            {item.name}
                          </span>
                          {item.value != null && (
                            <span className="text-slate-500 text-sm ml-2 font-mono">
                              {item.value} {item.unit}
                            </span>
                          )}
                        </div>
                        <StatusBadge status={item.status as ParamStatus} t={t} />
                      </li>
                    );
                  })}
                </ol>
              </>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <p className="text-sm text-emerald-800 font-medium">
                  {t("report.no_key_findings")}
                </p>
              </div>
            )}
          </Section>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* 5. RESULTS NEEDING ATTENTION                                       */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {abnormalParams.length > 0 && (
            <section aria-labelledby="attention-heading">
              <h2
                id="attention-heading"
                className="flex items-center gap-2 text-base font-bold text-slate-900 mb-3"
              >
                <AlertTriangle
                  aria-hidden="true"
                  className="h-5 w-5 text-amber-500 shrink-0"
                />
                {t("report.needs_attention_heading")}
                <span className="text-sm font-normal text-slate-400 ml-1">
                  ({abnormalParams.length})
                </span>
              </h2>
              <div className="space-y-3">
                {abnormalParams.map((param, idx) => (
                  <ParameterCard
                    key={`abnormal-${idx}`}
                    param={param}
                    lang={language}
                    defaultExpanded
                  />
                ))}
              </div>
            </section>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* 6. ALL RESULTS TABLE                                               */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {parameters.length > 0 && (
            <Section
              id="all-results-heading"
              heading={t("report.all_results_heading")}
              icon={FileText}
            >
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-left min-w-[400px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        {t("report.patient")}
                      </th>
                      <th className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">
                        {t("report.result_value_col")}
                      </th>
                      <th className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right hidden sm:table-cell">
                        {t("report.result_range_col")}
                      </th>
                      <th className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">
                        {t("report.result_status_col")}
                      </th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {parameters.map((param, idx) => (
                      <ResultsTableRow
                        key={idx}
                        param={param}
                        lang={language}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* 7. RESULTS WITHIN RANGE (expanded view for normal params)          */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {normalParams.length > 0 && (
            <section aria-labelledby="normal-toggle">
              <button
                id="normal-toggle"
                aria-expanded={normalOpen}
                aria-controls="normal-results-list"
                onClick={() => setNormalOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-3 text-left group mb-3"
              >
                <span className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-5 w-5 text-emerald-500 shrink-0"
                  />
                  {t("report.normal_results_heading")}
                  <span className="text-sm font-normal text-slate-400 ml-1">
                    ({normalParams.length})
                  </span>
                </span>
                {normalOpen ? (
                  <ChevronUp
                    aria-hidden="true"
                    className="h-5 w-5 text-slate-400 shrink-0 group-hover:text-slate-600"
                  />
                ) : (
                  <ChevronDown
                    aria-hidden="true"
                    className="h-5 w-5 text-slate-400 shrink-0 group-hover:text-slate-600"
                  />
                )}
              </button>

              {normalOpen && (
                <div id="normal-results-list" className="space-y-3">
                  <p className="text-sm text-slate-500 mb-3">
                    {t("report.normal_results_desc")}
                  </p>
                  {normalParams.map((param, idx) => (
                    <ParameterCard
                      key={`normal-${idx}`}
                      param={param}
                      lang={language}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Empty state */}
          {parameters.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <p className="text-slate-500 text-sm">{t("report.no_results")}</p>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* 8. PATTERN / COMBINATION ANALYSIS                                 */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <PatternAnalysis parameters={parameters} lang={language} t={t} />

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* 9. QUESTIONS TO ASK YOUR DOCTOR                                   */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {doctorQuestions.length > 0 && (
            <Section
              id="questions-heading"
              heading={t("report.questions_heading")}
              icon={MessageSquare}
              className="border-blue-100 bg-blue-50"
            >
              <ul className="space-y-3" role="list">
                {doctorQuestions.map((q, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-blue-900 leading-relaxed"
                  >
                    <ChevronRight
                      aria-hidden="true"
                      className="h-4 w-4 text-blue-400 shrink-0 mt-0.5"
                    />
                    {q}
                  </li>
                ))}
                <li className="flex items-start gap-3 text-sm text-blue-900 leading-relaxed">
                  <ChevronRight
                    aria-hidden="true"
                    className="h-4 w-4 text-blue-400 shrink-0 mt-0.5"
                  />
                  {t("report.questions_extra")}
                </li>
              </ul>
            </Section>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* 10. SYMPTOM CONTEXT                                                */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <Section
            id="symptom-heading"
            heading={t("report.symptom_context_heading")}
            icon={Activity}
          >
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {t("report.symptom_context_desc")}
            </p>
            <textarea
              id="symptom-input"
              value={symptomText}
              onChange={(e) => setSymptomText(e.target.value)}
              placeholder={t("report.symptom_placeholder")}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-slate-50 transition-colors"
              aria-label={t("report.symptom_context_heading")}
            />
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <Info aria-hidden="true" className="h-3 w-3 shrink-0" />
              {t("report.symptom_note")}
            </p>
          </Section>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* 11. ASK AI                                                         */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <Section
            id="ask-ai-heading"
            heading={t("report.ask_ai_heading")}
            icon={Sparkles}
          >
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {t("report.ask_ai_desc")}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                t("report.ask_ai_prompt_1"),
                t("report.ask_ai_prompt_2"),
                t("report.ask_ai_prompt_3"),
                t("report.ask_ai_prompt_4"),
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  className="text-xs font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-full px-3 py-1.5 transition-colors text-slate-600"
                  onClick={() => alert(t("report.ask_ai_coming_soon"))}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 italic">
              {t("report.ask_ai_coming_soon")}
            </p>
          </Section>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* 12. REPORT EXTRACTION CHECK                                        */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {parameters.length > 0 && (
            <Section
              id="extraction-heading"
              heading={t("report.extraction_heading")}
              icon={Search}
            >
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                {t("report.extraction_desc")}
              </p>
              <div className="space-y-2">
                {parameters.map((param, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0"
                  >
                    <ConfidenceDot confidence={param.confidence} />
                    <span className="flex-1 text-sm font-medium text-slate-700">
                      {param.name}
                    </span>
                    <span className="text-xs font-mono text-slate-500 hidden sm:block">
                      {param.value ?? "—"} {param.unit}
                    </span>
                    <ConfidenceLabel confidence={param.confidence} t={t} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* 13. REFERENCE RANGE NOTE                                           */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <aside
            aria-labelledby="ref-range-heading"
            className="bg-slate-50 rounded-2xl border border-slate-200 p-5"
          >
            <h2
              id="ref-range-heading"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2"
            >
              <BookOpen aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              {t("report.ref_range_note_heading")}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t("report.ref_range_note")}
            </p>
          </aside>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* 14. SOURCES                                                        */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <aside
            aria-labelledby="sources-heading"
            className="bg-slate-50 rounded-2xl border border-slate-200 p-5"
          >
            <h2
              id="sources-heading"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2"
            >
              <Globe aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              {t("report.sources_heading")}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t("report.sources_desc")}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {["MedlinePlus", "CDC", "WHO", "Laboratory Medicine Guidelines"].map(
                (src) => (
                  <li
                    key={src}
                    className="text-xs bg-white border border-slate-200 rounded-full px-3 py-1 text-slate-600"
                  >
                    {src}
                  </li>
                )
              )}
            </ul>
          </aside>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* 15. MEDICAL DISCLAIMER                                             */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <aside
            aria-label={t("report.disclaimer_heading")}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex gap-3"
          >
            <Shield
              aria-hidden="true"
              className="h-4 w-4 text-slate-400 shrink-0 mt-0.5"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {t("report.disclaimer_heading")}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("report.disclaimer_text")}
              </p>
              {/* Also show any backend-generated limitations */}
              {limitations.map((lim, idx) => (
                <p key={idx} className="text-xs text-slate-500 leading-relaxed mt-1.5">
                  {lim}
                </p>
              ))}
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
