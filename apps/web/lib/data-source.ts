import {
  findRepository,
  listAccessibleRepositories,
  mockOverview,
  mockReleaseAssets,
  mockReports,
  mockRepositories,
  mockSyncRuns,
  type OverviewData,
  type ReleaseAssetSummary,
  type ReportData,
  type RepositorySummary,
  type RuntimeConfig,
  type SyncRun,
  type TrendPoint
} from "@repopulse/core";
import { readReports, readSyncRuns } from "@repopulse/db";
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

export async function getGitHubDataSource(): Promise<GitHubDataSource> {
  return (await readRuntimeSource()).source;
}

export async function getRepositoryCollection(): Promise<{ source: GitHubDataSource; repositories: RepositorySummary[] }> {
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

    return { source, repositories: applyRuntimeSetupState(repositories, await getSetupState()) };
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

  return { source, overview: buildOverview(getTrackedRepositories(repositories), []) };
}

export async function getReportGenerationData(): Promise<{ source: GitHubDataSource; overview: OverviewData; repositories: RepositorySummary[]; assets: ReleaseAssetSummary[] }> {
  const { source, repositories } = await getRepositoryCollection();
  const assets = source.demo ? mockReleaseAssets : [];
  const trackedRepositories = source.demo ? repositories : getTrackedRepositories(repositories);
  const overview = source.demo ? mockOverview : buildOverview(trackedRepositories, assets);

  return { source, overview, repositories: trackedRepositories, assets };
}

export async function getRepositoryData(id: string): Promise<{ source: GitHubDataSource; repository?: RepositorySummary; repositories: RepositorySummary[] }> {
  const { source, repositories } = await getRepositoryCollection();
  return { source, repositories, repository: findRepository(repositories, id) };
}

export async function getReleaseData(): Promise<{ source: GitHubDataSource; assets: ReleaseAssetSummary[]; overview: OverviewData }> {
  const source = await getGitHubDataSource();
  if (source.demo) {
    return { source, assets: mockReleaseAssets, overview: mockOverview };
  }

  return { source, assets: [], overview: buildOverview([], []) };
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

function buildOverview(repositories: RepositorySummary[], assets: ReleaseAssetSummary[]): OverviewData {
  const emptyTrend: TrendPoint[] = [];

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
    growthTrends: emptyTrend,
    viewsVsClones: emptyTrend,
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
    activityFeed: []
  };
}

function getTrackedRepositories(repositories: RepositorySummary[]) {
  return repositories.filter((repo) => repo.tracked);
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
