"use client";

import type { ApiResponse, ReportData } from "@repopulse/core";
import { CalendarDays, FileJson, FileText, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { Locale } from "../../lib/i18n";

type ReportsActionsProps = {
  initialReport: ReportData | null;
  labels: {
    daily: string;
    exportJson: string;
    exportMarkdown: string;
    regenerate: string;
  };
  locale: Locale;
  onReportChange?: (report: ReportData) => void;
};

type Feedback = {
  tone: "green" | "red" | "slate";
  message: string;
};

export function ReportsActions({ initialReport, labels, locale, onReportChange }: ReportsActionsProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const copy = locale === "zh" ? zhCopy : enCopy;

  async function generateReport() {
    setBusy("generate");
    setFeedback(null);

    try {
      const response = await fetch("/api/reports/generate", {
        body: JSON.stringify({ type: "daily", useAI: false }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const payload = (await response.json().catch(() => null)) as ApiResponse<{ report: ReportData }> | null;
      if (!response.ok || !payload) {
        setFeedback({ tone: "red", message: copy.failed });
        return null;
      }
      if (!payload.ok) {
        setFeedback({ tone: "red", message: payload.error.message });
        return null;
      }

      onReportChange?.(payload.data.report);
      setFeedback({ tone: "green", message: copy.generated.replace("{title}", payload.data.report.title) });
      return payload.data.report;
    } catch (error) {
      setFeedback({ tone: "red", message: error instanceof Error ? error.message : copy.failed });
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function exportReport(format: "json" | "markdown") {
    setBusy(format);
    setFeedback(null);
    const activeReport = initialReport || await generateReport();
    if (!activeReport) {
      setBusy(null);
      return;
    }

    const content = format === "json" ? JSON.stringify(activeReport, null, 2) : activeReport.markdown;
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeReport.id}.${format === "json" ? "json" : "md"}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setFeedback({ tone: "green", message: copy.exported });
    setBusy(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium" onClick={() => setFeedback({ tone: "slate", message: copy.dailySelected })} type="button">
          <CalendarDays size={16} />
          {labels.daily}
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium disabled:opacity-60" disabled={busy !== null} onClick={() => exportReport("markdown")} type="button">
          <FileText size={16} />
          {busy === "markdown" ? copy.working : labels.exportMarkdown}
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium disabled:opacity-60" disabled={busy !== null} onClick={() => exportReport("json")} type="button">
          <FileJson size={16} />
          {busy === "json" ? copy.working : labels.exportJson}
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white disabled:opacity-60" disabled={busy !== null} onClick={generateReport} type="button">
          <RefreshCw className={busy === "generate" ? "animate-spin" : ""} size={16} />
          {busy === "generate" ? copy.working : labels.regenerate}
        </button>
      </div>
      {feedback ? <FeedbackMessage feedback={feedback} /> : null}
      {initialReport ? <p className="max-w-3xl text-sm text-slate-500">{initialReport.summary}</p> : null}
    </div>
  );
}

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  const tone = feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-700";
  return <div className={`rounded-lg border px-3 py-2 text-sm ${tone}`}>{feedback.message}</div>;
}

const zhCopy = {
  dailySelected: "已选择日报.",
  exported: "报告已准备下载.",
  failed: "操作失败.",
  generated: "已生成报告: {title}",
  working: "处理中..."
};

const enCopy = {
  dailySelected: "Daily report selected.",
  exported: "Report is ready to download.",
  failed: "Action failed.",
  generated: "Generated report: {title}",
  working: "Working..."
};
