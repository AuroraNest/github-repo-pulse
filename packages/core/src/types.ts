export type Visibility = "public" | "private" | "internal";
export type SyncStatus = "healthy" | "warning" | "error" | "syncing";

export type RepositorySummary = {
  id: string;
  githubRepoId: number;
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string;
  visibility: Visibility;
  isPrivate: boolean;
  primaryLanguage: string;
  stars: number;
  forks: number;
  totalViews: number;
  totalClones: number;
  visitors14d: number;
  clones14d: number;
  totalDownloads: number;
  todayDownloads: number;
  latestRelease: string;
  tracked: boolean;
  favorite: boolean;
  status: SyncStatus;
  lastSyncAt: string;
  updatedAt: string;
};

export type TrendPoint = {
  date: string;
  stars: number;
  forks: number;
  downloads: number;
  views: number;
  clones: number;
};

export type TrafficDailyPoint = {
  date: string;
  metric: "views" | "clones";
  count: number;
  uniques: number;
};

export type ReleaseAssetSummary = {
  id: string;
  githubAssetId?: number;
  releaseId?: string;
  githubReleaseId?: number;
  repositoryId: string;
  repository: string;
  tagName: string;
  releaseName?: string | null;
  releaseHtmlUrl?: string | null;
  releaseCreatedAt?: string;
  releaseUpdatedAt?: string;
  assetName: string;
  assetLabel?: string | null;
  assetSize: string;
  assetSizeBytes?: number;
  assetContentType?: string | null;
  assetState?: string | null;
  assetCreatedAt?: string;
  assetUpdatedAt?: string;
  publishedAt: string;
  totalDownloads: number;
  todayDownloads: number;
  sevenDayDownloads: number;
  thirtyDayDownloads: number;
  status: "Active" | "Baseline captured" | "Warning";
  browserDownloadUrl: string;
};

export type ActivityEvent = {
  id: string;
  title: string;
  repository: string;
  severity: "info" | "success" | "warning" | "error";
  happenedAt: string;
};

export type OverviewData = {
  kpis: {
    totalStars: number;
    totalForks: number;
    totalDownloads: number;
    downloadsToday: number;
    totalViews: number;
    totalClones: number;
    trackedRepositories: number;
  };
  growthTrends: TrendPoint[];
  viewsVsClones: TrendPoint[];
  fastestGrowingRepositories: Array<{
    repositoryId: string;
    name: string;
    growthPercent: number;
    metricValue: number;
  }>;
  topReleases: ReleaseAssetSummary[];
  activityFeed: ActivityEvent[];
};

export type ReportData = {
  id: string;
  type: "daily" | "weekly" | "monthly";
  title: string;
  generatedAt: string;
  summary: string;
  kpis: Array<{ label: string; value: string; change: string }>;
  highlights: string[];
  anomalies: string[];
  fastestMovers: Array<{ repository: string; metric: string; change: string; value: string }>;
  suggestedActions: string[];
  markdown: string;
  aiGenerated: boolean;
};

export type SyncRun = {
  id: string;
  trigger: "schedule" | "manual" | "setup" | "api";
  status: "running" | "success" | "partial_failed" | "failed" | "cancelled";
  startedAt: string;
  finishedAt?: string;
  totalRepositories: number;
  successCount: number;
  failedCount: number;
  errorMessage?: string;
};
