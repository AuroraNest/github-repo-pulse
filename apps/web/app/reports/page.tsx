import { getReportData, isGitHubConfigurationRequired } from "../../lib/data-source";
import { getDictionary } from "../../lib/locale";
import { ReportsView } from "./reports-view";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { locale, t } = await getDictionary();
  const { source, reports } = await getReportData();
  const sourceDescription = isGitHubConfigurationRequired(source) ? t.common.githubConfigurationRequiredDescription : source.message;

  return (
    <ReportsView
      initialReports={reports}
      labels={{
        actions: {
          daily: t.common.daily,
          exportJson: t.reports.exportJson,
          exportMarkdown: t.reports.exportMarkdown,
          regenerate: t.reports.regenerate
        },
        ai: t.common.ai,
        anomalies: t.reports.anomalies,
        deliveryOptions: t.reports.deliveryOptions,
        deliverySettings: t.reports.deliverySettings,
        description: t.reports.description,
        emptyDescription: sourceDescription,
        emptyTitle: isGitHubConfigurationRequired(source) ? t.common.githubConfigurationRequired : t.common.noReports,
        highlights: t.reports.highlights,
        kpiSummary: t.reports.kpiSummary,
        markdownPreview: t.reports.markdownPreview,
        recentReports: t.reports.recentReports,
        ruleBased: t.common.ruleBased,
        suggestedActions: t.reports.suggestedActions,
        title: t.reports.title
      }}
      locale={locale}
    />
  );
}
