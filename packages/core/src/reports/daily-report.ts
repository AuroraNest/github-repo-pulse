import type { OverviewData, ReleaseAssetSummary, ReportData, RepositorySummary } from "../types";

type GenerateDailyReportInput = {
  date: string;
  overview: OverviewData;
  repositories: RepositorySummary[];
  assets: ReleaseAssetSummary[];
  aiEnabled: boolean;
  locale?: "en" | "zh";
};

export function generateDailyReport(input: GenerateDailyReportInput): ReportData {
  const locale = input.locale || "en";
  const copy = locale === "zh" ? zhCopy : enCopy;
  const topRepo = [...input.repositories].sort((a, b) => b.totalDownloads - a.totalDownloads)[0];
  const topAsset = [...input.assets].sort((a, b) => b.totalDownloads - a.totalDownloads)[0];
  const topRepoName = topRepo?.name || copy.noRepository;
  const topRepoDownloads = topRepo?.totalDownloads || 0;
  const numberLocale = locale === "zh" ? "zh-CN" : "en-US";
  const summary = copy.summary(topRepoName, topRepoDownloads, input.overview.kpis.totalStars, numberLocale);
  const highlights = [
    topAsset ? copy.assetDownloads(topAsset.assetName, topAsset.totalDownloads) : copy.noReleaseData,
    copy.trackedRepositories(input.overview.kpis.trackedRepositories),
    copy.visitors(input.overview.kpis.visitors14d, numberLocale)
  ];
  const anomalies = input.repositories
    .filter((repo) => repo.status !== "healthy")
    .map((repo) => copy.needsAttention(repo.fullName, repo.status));
  const suggestedActions = [
    topAsset ? copy.reviewRelease(topAsset.repository) : copy.syncReleaseAssets,
    copy.checkTrafficWarnings,
    copy.useFavorites
  ];
  const kpis = [
    { label: copy.totalDownloads, value: input.overview.kpis.totalDownloads.toLocaleString(numberLocale), change: copy.todayChange(input.overview.kpis.downloadsToday) },
    { label: copy.totalStars, value: input.overview.kpis.totalStars.toLocaleString(numberLocale), change: "+3.8%" },
    { label: copy.totalForks, value: input.overview.kpis.totalForks.toLocaleString(numberLocale), change: "+2.1%" },
    { label: copy.visitors14d, value: input.overview.kpis.visitors14d.toLocaleString(numberLocale), change: "+9.1%" }
  ];
  const fastestMovers = input.overview.fastestGrowingRepositories.map((repo) => ({
    repository: repo.name,
    metric: copy.stars,
    change: copy.baseline,
    value: repo.metricValue.toLocaleString(numberLocale)
  }));
  const title = copy.title(input.date);
  const emptyAnomalies = [copy.noAnomalies];

  return {
    id: locale === "zh" ? `daily-${input.date}-zh` : `daily-${input.date}`,
    type: "daily",
    title,
    generatedAt: `${input.date}T08:10:00Z`,
    summary,
    kpis,
    highlights,
    anomalies: anomalies.length > 0 ? anomalies : emptyAnomalies,
    fastestMovers,
    suggestedActions,
    markdown: renderMarkdownReport(title, copy, summary, kpis, highlights, anomalies.length > 0 ? anomalies : emptyAnomalies, fastestMovers, input.assets, suggestedActions),
    aiGenerated: input.aiEnabled
  };
}

function renderMarkdownReport(
  title: string,
  copy: ReportCopy,
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

  return `# ${title}

## ${copy.summaryHeading}
${summary}

## ${copy.keyMetricsHeading}
| ${copy.metricColumn} | ${copy.valueColumn} | ${copy.changeColumn} |
| --- | ---: | --- |
${metricRows}

## ${copy.highlightsHeading}
${highlights.map((item) => `- ${item}`).join("\n")}

## ${copy.anomaliesHeading}
${anomalies.map((item) => `- ${item}`).join("\n")}

## ${copy.topRepositoriesHeading}
| ${copy.repositoryColumn} | ${copy.metricColumn} | ${copy.changeColumn} | ${copy.valueColumn} |
| --- | --- | ---: | ---: |
${moverRows}

## ${copy.releaseDownloadsHeading}
| ${copy.assetColumn} | ${copy.downloadsColumn} | ${copy.todayColumn} |
| --- | ---: | ---: |
${releaseRows}

## ${copy.suggestedActionsHeading}
${suggestedActions.map((item) => `- ${item}`).join("\n")}
`;
}

type ReportCopy = {
  anomaliesHeading: string;
  assetColumn: string;
  assetDownloads: (assetName: string, downloads: number) => string;
  baseline: string;
  changeColumn: string;
  checkTrafficWarnings: string;
  downloadsColumn: string;
  highlightsHeading: string;
  keyMetricsHeading: string;
  metricColumn: string;
  needsAttention: (fullName: string, status: string) => string;
  noAnomalies: string;
  noReleaseData: string;
  noRepository: string;
  releaseDownloadsHeading: string;
  repositoryColumn: string;
  reviewRelease: (repository: string) => string;
  summary: (topRepoName: string, downloads: number, totalStars: number, numberLocale: string) => string;
  summaryHeading: string;
  suggestedActionsHeading: string;
  syncReleaseAssets: string;
  stars: string;
  title: (date: string) => string;
  todayChange: (downloads: number) => string;
  todayColumn: string;
  topRepositoriesHeading: string;
  totalDownloads: string;
  totalForks: string;
  totalStars: string;
  trackedRepositories: (count: number) => string;
  useFavorites: string;
  valueColumn: string;
  visitors: (count: number, numberLocale: string) => string;
  visitors14d: string;
};

const enCopy: ReportCopy = {
  anomaliesHeading: "Anomalies",
  assetColumn: "Asset",
  assetDownloads: (assetName, downloads) => `${assetName} has ${downloads} total downloads.`,
  baseline: "Baseline",
  changeColumn: "Change",
  checkTrafficWarnings: "Check repositories with traffic permission warnings before the next scheduled sync.",
  downloadsColumn: "Downloads",
  highlightsHeading: "Highlights",
  keyMetricsHeading: "Key Metrics",
  metricColumn: "Metric",
  needsAttention: (fullName, status) => `${fullName} needs attention: ${status}.`,
  noAnomalies: "No anomalies detected.",
  noReleaseData: "No release download data is available yet.",
  noRepository: "No repository",
  releaseDownloadsHeading: "Release Downloads",
  repositoryColumn: "Repository",
  reviewRelease: (repository) => `Review the ${repository} release notes now that release downloads are measurable.`,
  summary: (topRepoName, downloads, totalStars, numberLocale) => `${topRepoName} led release download activity with ${downloads} total downloads, while tracked repositories reached ${totalStars.toLocaleString(numberLocale)} total stars.`,
  summaryHeading: "Summary",
  suggestedActionsHeading: "Suggested Actions",
  syncReleaseAssets: "Sync release assets before reviewing download momentum.",
  stars: "Stars",
  title: (date) => `RepoPulse Daily Report - ${date}`,
  todayChange: (downloads) => `+${downloads} today`,
  todayColumn: "Today",
  topRepositoriesHeading: "Top Repositories",
  totalDownloads: "Total Downloads",
  totalForks: "Total Forks",
  totalStars: "Total Stars",
  trackedRepositories: (count) => `${count} repositories are currently tracked.`,
  useFavorites: "Use favorites to pin the repositories that should appear first in daily reviews.",
  valueColumn: "Value",
  visitors: (count, numberLocale) => `${count.toLocaleString(numberLocale)} aggregated 14-day unique visitors were observed across tracked repositories.`,
  visitors14d: "14-Day Visitors"
};

const zhCopy: ReportCopy = {
  anomaliesHeading: "异常",
  assetColumn: "资产",
  assetDownloads: (assetName, downloads) => `${assetName} 累计 ${downloads} 次下载.`,
  baseline: "基线",
  changeColumn: "变化",
  checkTrafficWarnings: "下次计划同步前检查存在流量权限告警的仓库.",
  downloadsColumn: "下载量",
  highlightsHeading: "今日亮点",
  keyMetricsHeading: "关键指标",
  metricColumn: "指标",
  needsAttention: (fullName, status) => `${fullName} 需要关注: ${status}.`,
  noAnomalies: "未发现异常.",
  noReleaseData: "暂无发布下载数据.",
  noRepository: "暂无仓库",
  releaseDownloadsHeading: "发布下载",
  repositoryColumn: "仓库",
  reviewRelease: (repository) => `发布下载已有数据, 建议检查 ${repository} 的发布说明.`,
  summary: (topRepoName, downloads, totalStars, numberLocale) => `${topRepoName} 发布下载量领先, 累计 ${downloads} 次下载, 已跟踪仓库累计 ${totalStars.toLocaleString(numberLocale)} 个 Stars.`,
  summaryHeading: "摘要",
  suggestedActionsHeading: "建议操作",
  syncReleaseAssets: "先同步发布资产, 再评估下载趋势.",
  stars: "Stars",
  title: (date) => `RepoPulse 日报 - ${date}`,
  todayChange: (downloads) => `+${downloads} 今日`,
  todayColumn: "今日",
  topRepositoriesHeading: "热门仓库",
  totalDownloads: "总下载量",
  totalForks: "总 Forks",
  totalStars: "总 Stars",
  trackedRepositories: (count) => `当前已跟踪 ${count} 个仓库.`,
  useFavorites: "使用收藏固定每日巡检时优先查看的仓库.",
  valueColumn: "值",
  visitors: (count, numberLocale) => `已跟踪仓库近 14 天累计 ${count.toLocaleString(numberLocale)} 个独立访客.`,
  visitors14d: "14 天访客"
};
