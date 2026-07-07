import { CalendarDays, FileJson, FileText, RefreshCw } from "lucide-react";
import { mockReports } from "@repopulse/core";
import { Card, Chip, SectionTitle } from "../../components/ui";
import { getDictionary } from "../../lib/locale";

export default async function ReportsPage() {
  const { t } = await getDictionary();
  const report = mockReports[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{t.reports.title}</h1>
          <p className="mt-2 text-slate-500">{t.reports.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium"><CalendarDays size={16} />{t.common.daily}</button>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium"><FileText size={16} />{t.reports.exportMarkdown}</button>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium"><FileJson size={16} />{t.reports.exportJson}</button>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white"><RefreshCw size={16} />{t.reports.regenerate}</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <Card>
          <SectionTitle title={t.reports.recentReports} />
          <div className="mt-4 space-y-3">
            {mockReports.map((item) => (
              <button key={item.id} className="w-full rounded-lg border border-blue-200 bg-blue-50 p-3 text-left">
                <div className="font-medium">{item.title}</div>
                <div className="mt-1 text-xs text-slate-500">{item.generatedAt}</div>
              </button>
            ))}
            {["2026-07-06", "2026-07-05", "2026-07-04"].map((date) => (
              <button key={date} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left">
                <div className="font-medium">{t.reports.dailyReport} - {date}</div>
                <div className="mt-1 text-xs text-slate-500">{t.common.generated}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold">{report.title}</h2>
              <Chip>{report.aiGenerated ? t.common.ai : t.common.ruleBased}</Chip>
            </div>
            <p className="mt-3 text-slate-600">{report.summary}</p>
          </div>

          <section>
            <SectionTitle title={t.reports.kpiSummary} />
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

          <ReportList title={t.reports.highlights} items={report.highlights} />
          <ReportList title={t.reports.anomalies} items={report.anomalies} />
          <ReportList title={t.reports.suggestedActions} items={report.suggestedActions} />
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle title={t.reports.deliverySettings} />
            <div className="mt-4 space-y-3 text-sm">
              {t.reports.deliveryOptions.map((option, index) => (
                <label key={option} className="flex items-center gap-2"><input type="checkbox" defaultChecked={index < 3} />{option}</label>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle title={t.reports.markdownPreview} />
            <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">{report.markdown}</pre>
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
