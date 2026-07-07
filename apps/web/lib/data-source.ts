import {
  findRepository,
  listAccessibleRepositories,
  mockOverview,
  mockReleaseAssets,
  mockReports,
  mockRepositories,
  mockSyncRuns,
  readRuntimeConfig,
  type OverviewData,
  type ReleaseAssetSummary,
  type ReportData,
  type RepositorySummary,
  type RuntimeConfig,
  type SyncRun,
  type TrendPoint
} from "@repopulse/core";
import { getRuntimeGitHubToken } from "./runtime-github-token";

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

    return { source, repositories };
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

  return { source, overview: buildOverview(repositories, []) };
}

export async function getReportGenerationData(): Promise<{ source: GitHubDataSource; overview: OverviewData; repositories: RepositorySummary[]; assets: ReleaseAssetSummary[] }> {
  const { source, repositories } = await getRepositoryCollection();
  const assets = source.demo ? mockReleaseAssets : [];
  const overview = source.demo ? mockOverview : buildOverview(repositories, assets);

  return { source, overview, repositories, assets };
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
  return { source, reports: source.demo ? mockReports : [] };
}

export async function getSyncRunData(): Promise<{ source: GitHubDataSource; runs: SyncRun[] }> {
  const source = await getGitHubDataSource();
  return { source, runs: source.demo ? mockSyncRuns : [] };
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
  const rawConfig = readRuntimeConfig();
  const config = { ...rawConfig, githubToken: rawConfig.githubToken || await getRuntimeGitHubToken() };
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

function isRecoverableGitHubError(error: unknown) {
  const status = typeof error === "object" && error && "status" in error ? Number((error as { status: unknown }).status) : undefined;
  return status === 401 || status === 403 || status === 429;
}
