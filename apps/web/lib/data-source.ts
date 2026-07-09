import {
  findRepository,
  getRepositoryTrafficDetails,
  listAccessibleRepositories,
  listRepositoriesWithTrafficCounts,
  listReleaseAssetsForRepositories,
  mockOverview,
  mockReleaseAssets,
  mockReports,
  mockRepositories,
  mockSyncRuns,
  type ActivityEvent,
  type OverviewData,
  type ReleaseAssetSummary,
  type ReportData,
  type RepositorySummary,
  type RuntimeConfig,
  type SyncRun,
  type TrendPoint
} from "@repopulse/core";
import { readReleaseAssetDeltas, readRepositorySnapshotTrends, readReports, readSyncRuns, readTrafficDailyTrends } from "@repopulse/db";
import { readGitHubRuntimeConfig } from "./runtime-github-token";
import { applyRuntimeSetupState, getSetupState } from "./runtime-setup-state";

export type GitHubDataMode = "configuration_required" | "demo" | "live";

export type GitHubDataSource = {
  mode: GitHubDataMode;
  configured: boolean;
  demo: boolean;
  message: string;
};

export const githubConfigurationRequiredMessage = "Configure GITHUB_TOKEN for live GitHub data, or set MOCK_GITHUB=true to enable demo data.";

type RuntimeSource = {
  config: RuntimeConfig;
  source: GitHubDataSource;
};

type RepositoryCollectionOptions = {
  includeMetrics?: boolean;
};

export async function getGitHubDataSource(): Promise<GitHubDataSource> {
  return (await readRuntimeSource()).source;
}

export async function getRepositoryCollection(options: RepositoryCollectionOptions = {}): Promise<{ source: GitHubDataSource; repositories: RepositorySummary[] }> {
  const { config, source } = await readRuntimeSource();

  if (source.mode === "configuration_required") {
    return { source, repositories: [] };
  }

  try {
    const repositories = await listAccessibleRepositories({
      token: config.githubToken,
      baseUrl: config.githubApiBaseUrl,
      mock: source.demo
    });

    const setupRepositories = applyRuntimeSetupState(repositories, await getSetupState());
    if (!options.includeMetrics || source.demo) {
      return { source, repositories: setupRepositories };
    }

    return { source, repositories: await enrichRepositoriesWithLiveMetrics(setupRepositories, config) };
  } catch (error) {
    if (isRecoverableGitHubError(error)) {
      return {
        source: {
          mode: "configuration_required",
          configured: false,
          demo: false,
          message: "GitHub token is invalid, expired, rate-limited, or cannot list repositories. Verify the token on Setup."
        },
        repositories: []
      };
    }

    throw error;
  }
}

export async function getOverviewData(): Promise<{ source: GitHubDataSource; overview: OverviewData }> {
  const { source, repositories } = await getRepositoryCollection();
  if (source.demo) {
    return { source, overview: mockOverview };
  }

  const trackedRepositories = getTrackedRepositories(repositories);
  const runs = await readSyncRuns(5).catch(() => []);
  if (source.mode !== "live") {
    return { source, overview: buildOverview(trackedRepositories, [], buildSyncActivity(runs)) };
  }

  const config = await readGitHubRuntimeConfig();
  const githubOptions = {
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    mock: false
  };
  const [traffic, assets] = await Promise.all([
    listRepositoriesWithTrafficCounts(trackedRepositories, githubOptions).catch(() => ({
      repositories: trackedRepositories.map((repository) => ({
        ...repository,
        visitors14d: 0,
        clones14d: 0
      })),
      trends: []
    })),
    listReleaseAssetsForRepositories(trackedRepositories, githubOptions).catch(() => [])
  ]);
  const assetsWithDeltas = await applyPersistedReleaseDeltas(assets);
  const [growthTrends, storedTrafficTrends] = await Promise.all([
    readRepositorySnapshotTrends(trackedRepositories.map((repository) => repository.id), 30).catch(() => []),
    readTrafficDailyTrends(trackedRepositories.map((repository) => repository.id), 30).catch(() => [])
  ]);

  return { source, overview: buildOverview(traffic.repositories, assetsWithDeltas, buildSyncActivity(runs), growthTrends, storedTrafficTrends.length > 0 ? storedTrafficTrends : traffic.trends) };
}

export async function getReportGenerationData(): Promise<{ source: GitHubDataSource; overview: OverviewData; repositories: RepositorySummary[]; assets: ReleaseAssetSummary[] }> {
  const { config, source } = await readRuntimeSource();
  const repositories = source.demo ? mockRepositories : (await getRepositoryCollection({ includeMetrics: true })).repositories;
  const trackedRepositories = source.demo ? repositories : getTrackedRepositories(repositories);
  const liveAssets = source.demo ? mockReleaseAssets : await listReleaseAssetsForRepositories(trackedRepositories, {
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    mock: false
  }).catch(() => []);
  const assets = source.demo ? liveAssets : await applyPersistedReleaseDeltas(liveAssets);
  const overview = source.demo ? mockOverview : buildOverview(trackedRepositories, assets);

  return { source, overview, repositories: trackedRepositories, assets };
}

export async function getRepositoryData(id: string): Promise<{ source: GitHubDataSource; repository?: RepositorySummary; repositories: RepositorySummary[] }> {
  const { config, source } = await readRuntimeSource();
  const { repositories } = await getRepositoryCollection();
  const repository = findRepository(repositories, id);
  if (!repository || source.demo || source.mode !== "live") {
    return { source, repositories, repository };
  }

  const [enrichedRepository] = await enrichRepositoriesWithLiveMetrics([repository], config);
  return {
    source,
    repositories,
    repository: enrichedRepository || repository
  };
}

export async function getRepositoryReleaseAssets(repository: RepositorySummary): Promise<ReleaseAssetSummary[]> {
  const { config, source } = await readRuntimeSource();
  if (source.demo) {
    return mockReleaseAssets.filter((asset) => asset.repositoryId === repository.id);
  }
  if (source.mode !== "live") return [];

  const assets = await listReleaseAssetsForRepositories([repository], {
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    mock: false
  }).catch(() => []);
  return applyPersistedReleaseDeltas(assets);
}

export async function getRepositoryTrafficTrends(repository: RepositorySummary): Promise<TrendPoint[]> {
  return (await getRepositoryTrafficData(repository)).trends;
}

export async function getRepositoryTrafficData(repository: RepositorySummary) {
  const { config, source } = await readRuntimeSource();
  if (source.demo) {
    return {
      trends: mockOverview.viewsVsClones,
      daily: [],
      popularPaths: [
        { path: "/README.md", title: "README", count: Math.max(1, Math.round(repository.visitors14d / 2)), uniques: Math.max(1, Math.round(repository.visitors14d / 3)) },
        { path: "/releases", title: "Releases", count: Math.max(1, Math.round(repository.visitors14d / 3)), uniques: Math.max(1, Math.round(repository.visitors14d / 4)) },
        { path: `/releases/tag/${repository.latestRelease}`, title: repository.latestRelease, count: Math.max(1, Math.round(repository.visitors14d / 4)), uniques: Math.max(1, Math.round(repository.visitors14d / 5)) }
      ],
      referrers: []
    };
  }
  if (source.mode !== "live") return { trends: [], daily: [], popularPaths: [], referrers: [] };

  return getRepositoryTrafficDetails(repository, {
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    mock: false
  }).catch(() => ({ trends: [], daily: [], popularPaths: [], referrers: [] }));
}

export async function getReleaseData(): Promise<{ source: GitHubDataSource; assets: ReleaseAssetSummary[]; overview: OverviewData }> {
  const { config, source } = await readRuntimeSource();
  if (source.demo) {
    return { source, assets: mockReleaseAssets, overview: mockOverview };
  }

  const { repositories } = await getRepositoryCollection();
  const trackedRepositories = getTrackedRepositories(repositories);
  const liveAssets = await listReleaseAssetsForRepositories(trackedRepositories, {
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    mock: false
  }).catch(() => []);
  const assets = await applyPersistedReleaseDeltas(liveAssets);

  return { source, assets, overview: buildOverview(trackedRepositories, assets) };
}

export async function getReportData(): Promise<{ source: GitHubDataSource; reports: ReportData[] }> {
  const source = await getGitHubDataSource();
  if (source.demo) return { source, reports: mockReports };

  const reports = await readReports().catch(() => []);
  return { source, reports: reports.map(toReportData) };
}

export async function getSyncRunData(): Promise<{ source: GitHubDataSource; runs: SyncRun[] }> {
  const source = await getGitHubDataSource();
  if (source.demo) return { source, runs: mockSyncRuns };

  const runs = await readSyncRuns().catch(() => []);
  return {
    source,
    runs: runs.map((run) => ({
      id: run.id,
      trigger: run.trigger,
      status: run.status,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt || undefined,
      totalRepositories: run.totalRepositories,
      successCount: run.successCount,
      failedCount: run.failedCount,
      errorMessage: run.errorMessage || undefined
    }))
  };
}

export function isGitHubConfigurationRequired(source: GitHubDataSource) {
  return source.mode === "configuration_required";
}

export function githubDataSourcePayload(source: GitHubDataSource) {
  return {
    mode: source.mode,
    configured: source.configured,
    demo: source.demo,
    message: source.message
  };
}

async function readRuntimeSource(): Promise<RuntimeSource> {
  const config = await readGitHubRuntimeConfig();
  if (config.mockGitHub) {
    return {
      config,
      source: {
        mode: "demo",
        configured: true,
        demo: true,
        message: "Demo mode is enabled by MOCK_GITHUB=true."
      }
    };
  }

  if (config.githubToken) {
    return {
      config,
      source: {
        mode: "live",
        configured: true,
        demo: false,
        message: "Live GitHub token is configured."
      }
    };
  }

  return {
    config,
    source: {
      mode: "configuration_required",
      configured: false,
      demo: false,
      message: githubConfigurationRequiredMessage
    }
  };
}

function buildOverview(repositories: RepositorySummary[], assets: ReleaseAssetSummary[], activityFeed: ActivityEvent[] = [], growthTrends: TrendPoint[] = [], viewsVsClones: TrendPoint[] = []): OverviewData {
  return {
    kpis: {
      totalStars: repositories.reduce((sum, repo) => sum + repo.stars, 0),
      totalForks: repositories.reduce((sum, repo) => sum + repo.forks, 0),
      totalDownloads: assets.reduce((sum, asset) => sum + asset.totalDownloads, 0),
      downloadsToday: assets.reduce((sum, asset) => sum + asset.todayDownloads, 0),
      visitors14d: repositories.reduce((sum, repo) => sum + repo.visitors14d, 0),
      clones14d: repositories.reduce((sum, repo) => sum + repo.clones14d, 0),
      trackedRepositories: repositories.filter((repo) => repo.tracked).length
    },
    growthTrends,
    viewsVsClones,
    fastestGrowingRepositories: repositories
      .slice()
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 3)
      .map((repo) => ({
        repositoryId: repo.id,
        name: repo.name,
        growthPercent: 0,
        metricValue: repo.stars
      })),
    topReleases: assets,
    activityFeed
  };
}

function buildSyncActivity(runs: Awaited<ReturnType<typeof readSyncRuns>>): ActivityEvent[] {
  return runs.map((run) => ({
    id: `activity-${run.id}`,
    title: run.status === "success" ? "Sync completed" : run.status === "partial_failed" ? "Sync partially completed" : "Sync failed",
    repository: `${run.successCount}/${run.totalRepositories} repositories synced`,
    severity: run.status === "success" ? "success" : run.status === "partial_failed" ? "warning" : "error",
    happenedAt: run.finishedAt || run.startedAt
  }));
}

function getTrackedRepositories(repositories: RepositorySummary[]) {
  const trackedRepositories = repositories.filter((repo) => repo.tracked);
  return trackedRepositories.length > 0 ? trackedRepositories : repositories;
}

async function enrichRepositoriesWithLiveMetrics(repositories: RepositorySummary[], config: RuntimeConfig) {
  const githubOptions = {
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    mock: false
  };
  const [traffic, assets] = await Promise.all([
    listRepositoriesWithTrafficCounts(repositories, githubOptions).catch(() => ({ repositories, trends: [] })),
    listReleaseAssetsForRepositories(repositories, githubOptions).catch(() => [])
  ]);
  const releaseByRepository = new Map<string, { totalDownloads: number; latestRelease?: string; publishedAt: string }>();
  for (const asset of assets) {
    const current = releaseByRepository.get(asset.repositoryId);
    const totalDownloads = (current?.totalDownloads || 0) + asset.totalDownloads;
    const isLatest = !current || asset.publishedAt.localeCompare(current.publishedAt) > 0;
    releaseByRepository.set(asset.repositoryId, {
      totalDownloads,
      latestRelease: isLatest ? asset.tagName : current?.latestRelease,
      publishedAt: isLatest ? asset.publishedAt : current?.publishedAt || ""
    });
  }
  return traffic.repositories.map((repository) => ({
    ...repository,
    latestRelease: releaseByRepository.get(repository.id)?.latestRelease || repository.latestRelease,
    totalDownloads: releaseByRepository.get(repository.id)?.totalDownloads || repository.totalDownloads
  }));
}

async function applyPersistedReleaseDeltas(assets: ReleaseAssetSummary[]) {
  const deltas = await readReleaseAssetDeltas(assets.map((asset) => asset.id)).catch(() => new Map());
  return assets.map((asset) => {
    const delta = deltas.get(asset.id);
    if (!delta) return asset;
    return {
      ...asset,
      totalDownloads: delta.latestDownloadCount || asset.totalDownloads,
      todayDownloads: delta.todayDownloads,
      sevenDayDownloads: delta.sevenDayDownloads,
      thirtyDayDownloads: delta.thirtyDayDownloads,
      status: "Active" as const
    };
  });
}

function isRecoverableGitHubError(error: unknown) {
  const status = typeof error === "object" && error && "status" in error ? Number((error as { status: unknown }).status) : undefined;
  return status === 401 || status === 403 || status === 429;
}

function toReportData(report: Awaited<ReturnType<typeof readReports>>[number]): ReportData {
  const data = report.data as Partial<ReportData>;
  return {
    id: report.id,
    type: report.type,
    title: report.title,
    generatedAt: typeof data.generatedAt === "string" ? data.generatedAt : report.generatedAt,
    summary: report.summary,
    kpis: Array.isArray(data.kpis) ? data.kpis as ReportData["kpis"] : [],
    highlights: Array.isArray(data.highlights) ? data.highlights as string[] : [],
    anomalies: Array.isArray(data.anomalies) ? data.anomalies as string[] : [],
    fastestMovers: Array.isArray(data.fastestMovers) ? data.fastestMovers as ReportData["fastestMovers"] : [],
    suggestedActions: Array.isArray(data.suggestedActions) ? data.suggestedActions as string[] : [],
    markdown: report.markdown,
    aiGenerated: report.aiGenerated
  };
}
