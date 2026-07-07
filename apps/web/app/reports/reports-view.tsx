"use client";

import type { ReportData } from "@repopulse/core";
import { useState } from "react";
import { Card, Chip, EmptyState, SectionTitle } from "../../components/ui";
import type { Locale } from "../../lib/i18n";
import { ReportsActions } from "./reports-actions";

type ReportsViewLabels = {
  actions: {
    daily: string;
    exportJson: string;
    exportMarkdown: string;
    regenerate: string;
  };
  ai: string;
  anomalies: string;
  deliveryOptions: readonly string[];
  deliverySettings: string;
  description: string;
  emptyDescription: string;
  emptyTitle: string;
  highlights: string;
  kpiSummary: string;
  markdownPreview: string;
  recentReports: string;
  ruleBased: string;
  suggestedActions: string;
  title: string;
};

export function ReportsView({
  initialReports,
  labels,
  locale
}: {
  initialReports: ReportData[];
  labels: ReportsViewLabels;
  locale: Locale;
}) {
  const [reports, setReports] = useState(initialReports);
  const [report, setReport] = useState<ReportData | null>(initialReports[0] || null);

  function handleReportChange(nextReport: ReportData) {
    setReport(nextReport);
    setReports((items) => [nextReport, ...items.filter((item) => item.id !== nextReport.id)]);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{labels.title}</h1>
          <p className="mt-2 text-slate-500">{labels.description}</p>
        </div>
        <ReportsActions initialReport={report} labels={labels.actions} locale={locale} onReportChange={handleReportChange} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <Card>
          <SectionTitle title={labels.recentReports} />
          <div className="mt-4 space-y-3">
            {reports.map((item) => (
              <button key={item.id} className={`w-full rounded-lg border p-3 text-left ${item.id === report?.id ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`} onClick={() => setReport(item)} type="button">
                <div className="font-medium">{item.title}</div>
                <div className="mt-1 text-xs text-slate-500">{item.generatedAt}</div>
              </button>
            ))}
            {reports.length === 0 ? <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} /> : null}
          </div>
        </Card>

        <Card className="space-y-6">
          {report ? (
            <>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold">{report.title}</h2>
                  <Chip>{report.aiGenerated ? labels.ai : labels.ruleBased}</Chip>
                </div>
                <p className="mt-3 text-slate-600">{report.summary}</p>
              </div>

              <section>
                <SectionTitle title={labels.kpiSummary} />
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {report.kpis.map((kpi) => (
                    <div key={kpi.label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="text-sm text-slate-500">{kpi.label}</div>
                      <div className="mt-2 text-2xl font-semibold">{kpi.value}</div>
                      <div className="text-sm text-emerald-600">{kpi.change}</div>
                    </div>
                  ))}
                </div>
              </section>

              <ReportList title={labels.highlights} items={report.highlights} />
              <ReportList title={labels.anomalies} items={report.anomalies} />
              <ReportList title={labels.suggestedActions} items={report.suggestedActions} />
            </>
          ) : (
            <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} />
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle title={labels.deliverySettings} />
            <div className="mt-4 space-y-3 text-sm">
              {labels.deliveryOptions.map((option, index) => (
                <label key={option} className="flex items-center gap-2"><input type="checkbox" defaultChecked={index < 3} />{option}</label>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle title={labels.markdownPreview} />
            {report ? <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">{report.markdown}</pre> : <div className="mt-4"><EmptyState title={labels.emptyTitle} description={labels.emptyDescription} /></div>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <SectionTitle title={title} />
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">{item}</li>
        ))}
      </ul>
    </section>
  );
}
