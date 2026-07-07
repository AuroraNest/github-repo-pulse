import type { ActivityEvent, OverviewData, ReleaseAssetSummary, RepositorySummary, ReportData, SyncRun, TrendPoint } from "./types";
import { generateDailyReport } from "./reports/daily-report";

const today = "2026-07-07";

export const mockRepositories: RepositorySummary[] = [
  {
    id: "repo-modify-positioning",
    githubRepoId: 7576777401,
    owner: "AuroraNest",
    name: "Modify_Positioning",
    fullName: "AuroraNest/Modify_Positioning",
    htmlUrl: "https://github.com/AuroraNest/Modify_Positioning",
    description: "Android positioning utility with release download tracking.",
    visibility: "public",
    isPrivate: false,
    primaryLanguage: "Kotlin",
    stars: 1280,
    forks: 142,
    visitors14d: 2468,
    clones14d: 612,
    totalDownloads: 8720,
    todayDownloads: 72,
    latestRelease: "v2.3.0",
    tracked: true,
    favorite: true,
    status: "healthy",
    lastSyncAt: `${today}T08:00:00Z`,
    updatedAt: "2026-07-06T16:24:00Z"
  },
  {
    id: "repo-queue",
    githubRepoId: 7576777402,
    owner: "AuroraNest",
    name: "Queue",
    fullName: "AuroraNest/Queue",
    htmlUrl: "https://github.com/AuroraNest/Queue",
    description: "Queue service experiments and desktop packages.",
    visibility: "private",
    isPrivate: true,
    primaryLanguage: "C#",
    stars: 842,
    forks: 86,
    visitors14d: 1580,
    clones14d: 430,
    totalDownloads: 4320,
    todayDownloads: 38,
    latestRelease: "v1.8.1",
    tracked: true,
    favorite: false,
    status: "warning",
    lastSyncAt: `${today}T08:02:00Z`,
    updatedAt: "2026-07-05T09:30:00Z"
  },
  {
    id: "repo-toolbox",
    githubRepoId: 7576777403,
    owner: "AuroraNest",
    name: "toolbox",
    fullName: "AuroraNest/toolbox",
    htmlUrl: "https://github.com/AuroraNest/toolbox",
    description: "Small operational tools and scripts.",
    visibility: "public",
    isPrivate: false,
    primaryLanguage: "TypeScript",
    stars: 2210,
    forks: 238,
    visitors14d: 3820,
    clones14d: 1040,
    totalDownloads: 12640,
    todayDownloads: 115,
    latestRelease: "v4.1.0",
    tracked: true,
    favorite: true,
    status: "healthy",
    lastSyncAt: `${today}T08:03:00Z`,
    updatedAt: "2026-07-07T02:10:00Z"
  },
  {
    id: "repo-devstatus-lite",
    githubRepoId: 7576777404,
    owner: "AuroraNest",
    name: "devstatus-lite",
    fullName: "AuroraNest/devstatus-lite",
    htmlUrl: "https://github.com/AuroraNest/devstatus-lite",
    description: "Lightweight macOS development status monitor.",
    visibility: "public",
    isPrivate: false,
    primaryLanguage: "Swift",
    stars: 965,
    forks: 91,
    visitors14d: 1240,
    clones14d: 310,
    totalDownloads: 6840,
    todayDownloads: 44,
    latestRelease: "v1.2.4",
    tracked: true,
    favorite: false,
    status: "healthy",
    lastSyncAt: `${today}T08:04:00Z`,
    updatedAt: "2026-07-04T20:10:00Z"
  }
];

export const mockTrends: TrendPoint[] = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1;
  return {
    date: `2026-06-${String(day + 7).padStart(2, "0")}`,
    stars: 4200 + index * 36,
    forks: 580 + index * 8,
    downloads: 9800 + index * 310 + (index % 5) * 90,
    views: 1200 + index * 42,
    clones: 260 + index * 11
  };
});

export const mockReleaseAssets: ReleaseAssetSummary[] = [
  {
    id: "asset-modify-apk",
    repositoryId: "repo-modify-positioning",
    repository: "Modify_Positioning",
    tagName: "v2.3.0",
    assetName: "Modify_Positioning-installable-f6fb4b9.apk",
    assetSize: "28.6 MB",
    publishedAt: "2026-05-29",
    totalDownloads: 8720,
    todayDownloads: 72,
    sevenDayDownloads: 326,
    thirtyDayDownloads: 1280,
    status: "Active",
    browserDownloadUrl: "https://github.com/AuroraNest/Modify_Positioning/releases"
  },
  {
    id: "asset-queue-zip",
    repositoryId: "repo-queue",
    repository: "Queue",
    tagName: "v1.8.1",
    assetName: "Queue-darwin-arm64.zip",
    assetSize: "18.4 MB",
    publishedAt: "2026-06-22",
    totalDownloads: 4320,
    todayDownloads: 38,
    sevenDayDownloads: 204,
    thirtyDayDownloads: 890,
    status: "Active",
    browserDownloadUrl: "https://github.com/AuroraNest/Queue/releases"
  },
  {
    id: "asset-toolbox-tgz",
    repositoryId: "repo-toolbox",
    repository: "toolbox",
    tagName: "v4.1.0",
    assetName: "toolbox-linux-x64.tar.gz",
    assetSize: "12.2 MB",
    publishedAt: "2026-06-30",
    totalDownloads: 12640,
    todayDownloads: 115,
    sevenDayDownloads: 618,
    thirtyDayDownloads: 2230,
    status: "Active",
    browserDownloadUrl: "https://github.com/AuroraNest/toolbox/releases"
  }
];

export const mockActivity: ActivityEvent[] = [
  { id: "act-1", title: "Downloads increased 15.6% today", repository: "Modify_Positioning", severity: "success", happenedAt: `${today}T08:20:00Z` },
  { id: "act-2", title: "Traffic data returned 403; repo metrics still synced", repository: "Queue", severity: "warning", happenedAt: `${today}T08:18:00Z` },
  { id: "act-3", title: "Daily report generated", repository: "All repositories", severity: "info", happenedAt: `${today}T08:12:00Z` }
];

export const mockSyncRuns: SyncRun[] = [
  {
    id: "sync-20260707",
    trigger: "schedule",
    status: "partial_failed",
    startedAt: `${today}T08:00:00Z`,
    finishedAt: `${today}T08:05:00Z`,
    totalRepositories: 4,
    successCount: 3,
    failedCount: 1,
    errorMessage: "Traffic permission missing for 1 private repository."
  }
];

export const mockOverview: OverviewData = {
  kpis: {
    totalStars: mockRepositories.reduce((sum, repo) => sum + repo.stars, 0),
    totalForks: mockRepositories.reduce((sum, repo) => sum + repo.forks, 0),
    totalDownloads: mockReleaseAssets.reduce((sum, asset) => sum + asset.totalDownloads, 0),
    downloadsToday: mockReleaseAssets.reduce((sum, asset) => sum + asset.todayDownloads, 0),
    visitors14d: mockRepositories.reduce((sum, repo) => sum + repo.visitors14d, 0),
    clones14d: mockRepositories.reduce((sum, repo) => sum + repo.clones14d, 0),
    trackedRepositories: mockRepositories.filter((repo) => repo.tracked).length
  },
  growthTrends: mockTrends,
  viewsVsClones: mockTrends,
  fastestGrowingRepositories: [
    { repositoryId: "repo-toolbox", name: "toolbox", growthPercent: 18.4, metricValue: 2210 },
    { repositoryId: "repo-modify-positioning", name: "Modify_Positioning", growthPercent: 15.6, metricValue: 8720 },
    { repositoryId: "repo-devstatus-lite", name: "devstatus-lite", growthPercent: 9.7, metricValue: 965 }
  ],
  topReleases: mockReleaseAssets,
  activityFeed: mockActivity
};

export const mockReports: ReportData[] = [
  generateDailyReport({
    date: today,
    overview: mockOverview,
    repositories: mockRepositories,
    assets: mockReleaseAssets,
    aiEnabled: false
  })
];
