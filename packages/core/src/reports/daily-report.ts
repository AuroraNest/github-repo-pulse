import type { OverviewData, ReleaseAssetSummary, ReportData, RepositorySummary } from "../types";

type GenerateDailyReportInput = {
  date: string;
  overview: OverviewData;
  repositories: RepositorySummary[];
  assets: ReleaseAssetSummary[];
  aiEnabled: boolean;
};

export function generateDailyReport(input: GenerateDailyReportInput): ReportData {
  const topRepo = [...input.repositories].sort((a, b) => b.todayDownloads - a.todayDownloads)[0];
  const topAsset = [...input.assets].sort((a, b) => b.todayDownloads - a.todayDownloads)[0];
  const topRepoName = topRepo?.name || "No repository";
  const topRepoDownloads = topRepo?.todayDownloads || 0;
  const summary = `${topRepoName} led today's repository activity with ${topRepoDownloads} new downloads, while tracked repositories reached ${input.overview.kpis.totalStars.toLocaleString()} total stars.`;
  const highlights = [
    topAsset ? `${topAsset.assetName} added ${topAsset.todayDownloads} downloads today.` : "No release download data is available yet.",
    `${input.overview.kpis.trackedRepositories} repositories are currently tracked.`,
    `${input.overview.kpis.visitors14d.toLocaleString()} aggregated 14-day unique visitors were observed across tracked repositories.`
  ];
  const anomalies = input.repositories
    .filter((repo) => repo.status !== "healthy")
    .map((repo) => `${repo.fullName} needs attention: ${repo.status}.`);
  const suggestedActions = [
    topAsset ? `Review the ${topAsset.repository} release notes while download momentum is high.` : "Sync release assets before reviewing download momentum.",
    "Check repositories with traffic permission warnings before the next scheduled sync.",
    "Use favorites to pin the repositories that should appear first in daily reviews."
  ];
  const kpis = [
    { label: "Total Downloads", value: input.overview.kpis.totalDownloads.toLocaleString(), change: `+${input.overview.kpis.downloadsToday} today` },
    { label: "Total Stars", value: input.overview.kpis.totalStars.toLocaleString(), change: "+3.8%" },
    { label: "Total Forks", value: input.overview.kpis.totalForks.toLocaleString(), change: "+2.1%" },
    { label: "14-Day Visitors", value: input.overview.kpis.visitors14d.toLocaleString(), change: "+9.1%" }
  ];
  const fastestMovers = input.overview.fastestGrowingRepositories.map((repo) => ({
    repository: repo.name,
    metric: "Growth",
    change: `+${repo.growthPercent}%`,
    value: repo.metricValue.toLocaleString()
  }));

  return {
    id: `daily-${input.date}`,
    type: "daily",
    title: `RepoPulse Daily Report - ${input.date}`,
    generatedAt: `${input.date}T08:10:00Z`,
    summary,
    kpis,
    highlights,
    anomalies: anomalies.length > 0 ? anomalies : ["No anomalies detected."],
    fastestMovers,
    suggestedActions,
    markdown: renderMarkdownReport(input.date, summary, kpis, highlights, anomalies, fastestMovers, input.assets, suggestedActions),
    aiGenerated: input.aiEnabled
  };
}

function renderMarkdownReport(
  date: string,
  summary: string,
  kpis: ReportData["kpis"],
  highlights: string[],
  anomalies: string[],
  fastestMovers: ReportData["fastestMovers"],
  assets: ReleaseAssetSummary[],
  suggestedActions: string[]
) {
  const metricRows = kpis.map((kpi) => `| ${kpi.label} | ${kpi.value} | ${kpi.change} |`).join("\n");
  const moverRows = fastestMovers.map((mover) => `| ${mover.repository} | ${mover.metric} | ${mover.change} | ${mover.value} |`).join("\n");
  const releaseRows = assets.map((asset) => `| ${asset.assetName} | ${asset.totalDownloads} | +${asset.todayDownloads} |`).join("\n");

  return `# RepoPulse Daily Report - ${date}

## Summary
${summary}

## Key Metrics
| Metric | Value | Change |
| --- | ---: | --- |
${metricRows}

## Highlights
${highlights.map((item) => `- ${item}`).join("\n")}

## Anomalies
${(anomalies.length > 0 ? anomalies : ["No anomalies detected."]).map((item) => `- ${item}`).join("\n")}

## Top Repositories
| Repository | Metric | Change | Value |
| --- | --- | ---: | ---: |
${moverRows}

## Release Downloads
| Asset | Downloads | Today |
| --- | ---: | ---: |
${releaseRows}

## Suggested Actions
${suggestedActions.map((item) => `- ${item}`).join("\n")}
`;
}
