import { Octokit } from "@octokit/rest";
import { mockRepositories } from "../mock-data";
import type { ReleaseAssetSummary, RepositorySummary, TrafficDailyPoint, TrendPoint } from "../types";

export type GitHubClientOptions = {
  token?: string;
  baseUrl?: string;
  userAgent?: string;
  mock?: boolean;
};

export type TokenVerificationResult = {
  account: { login: string; id: number; avatarUrl: string };
  tokenMask: string;
  permissions: Array<{ name: string; ok: boolean; note?: string }>;
};

export type RepositorySyncResult = {
  repositoryId: string;
  status: "success" | "partial_failed" | "failed";
  collectedRepo: boolean;
  collectedTraffic: boolean;
  collectedReleases: boolean;
  errorCode?: "TRAFFIC_PERMISSION_MISSING" | "GITHUB_FORBIDDEN" | "GITHUB_UNAUTHORIZED" | "GITHUB_RATE_LIMITED" | "UNKNOWN";
  errorMessage?: string;
};

export type RepositoryPopularPath = {
  path: string;
  title: string;
  count: number;
  uniques: number;
};

export type RepositoryReferrer = {
  referrer: string;
  count: number;
  uniques: number;
};

export type RepositoryTrafficDetails = {
  trends: TrendPoint[];
  daily: TrafficDailyPoint[];
  popularPaths: RepositoryPopularPath[];
  referrers: RepositoryReferrer[];
};

export class GitHubConfigurationRequiredError extends Error {
  code = "GITHUB_CONFIGURATION_REQUIRED" as const;

  constructor() {
    super("GitHub token is required unless MOCK_GITHUB=true is explicitly enabled.");
    this.name = "GitHubConfigurationRequiredError";
  }
}

export function createGitHubClient(options: GitHubClientOptions) {
  if (options.mock) {
    return null;
  }

  if (!options.token) {
    throw new GitHubConfigurationRequiredError();
  }

  return new Octokit({
    auth: options.token,
    baseUrl: options.baseUrl || "https://api.github.com",
    userAgent: options.userAgent || "RepoPulse MVP"
  });
}

export async function verifyGitHubToken(options: GitHubClientOptions): Promise<TokenVerificationResult> {
  if (options.mock) {
    return {
      account: { login: "MockGitHubUser", id: 75767774, avatarUrl: "https://github.com/github.png" },
      tokenMask: maskToken(options.token || "github_pat_mocktoken"),
      permissions: defaultPermissions("Mock mode; traffic permissions are confirmed during sync.")
    };
  }

  const client = createGitHubClient(options);
  if (!client) {
    throw new GitHubConfigurationRequiredError();
  }

  const user = await client.rest.users.getAuthenticated();

  return {
    account: {
      login: user.data.login,
      id: user.data.id,
      avatarUrl: user.data.avatar_url
    },
    tokenMask: maskToken(options.token || ""),
    permissions: defaultPermissions("Traffic access may still return 403 per repository.")
  };
}

export async function listAccessibleRepositories(options: GitHubClientOptions): Promise<RepositorySummary[]> {
  if (options.mock) {
    return mockRepositories;
  }

  const client = createGitHubClient(options);
  if (!client) {
    throw new GitHubConfigurationRequiredError();
  }

  const repos = await client.paginate(client.rest.repos.listForAuthenticatedUser, {
    visibility: "all",
    affiliation: "owner,collaborator,organization_member",
    per_page: 100,
    sort: "updated"
  });

  return repos.map((repo) => ({
    id: `github-${repo.id}`,
    githubRepoId: repo.id,
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    htmlUrl: repo.html_url,
    description: repo.description || "No description provided.",
    visibility: repo.private ? "private" : "public",
    isPrivate: repo.private,
    primaryLanguage: repo.language || "Unknown",
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    visitors14d: 0,
    clones14d: 0,
    totalDownloads: 0,
    todayDownloads: 0,
    latestRelease: "Not synced",
    tracked: false,
    favorite: false,
    status: "healthy",
    lastSyncAt: "Not synced",
    updatedAt: repo.updated_at || new Date().toISOString()
  }));
}

export async function listRepositoriesWithTrafficCounts(repositories: RepositorySummary[], options: GitHubClientOptions): Promise<{ repositories: RepositorySummary[]; trends: TrendPoint[] }> {
  if (options.mock) return { repositories, trends: [] };

  const client = createGitHubClient(options);
  if (!client) {
    throw new GitHubConfigurationRequiredError();
  }

  const dailyTraffic = new Map<string, { views: number; clones: number }>();
  const enrichedRepositories = await Promise.all(repositories.map(async (repository) => {
    const [views, clones] = await Promise.all([
      client.request("GET /repos/{owner}/{repo}/traffic/views", {
        owner: repository.owner,
        repo: repository.name,
        per: "day"
      }).catch(() => null),
      client.request("GET /repos/{owner}/{repo}/traffic/clones", {
        owner: repository.owner,
        repo: repository.name,
        per: "day"
      }).catch(() => null)
    ]);

    for (const point of readTrafficSeries(views?.data, "views", "uniques")) {
      const current = dailyTraffic.get(point.date) || { views: 0, clones: 0 };
      dailyTraffic.set(point.date, { ...current, views: current.views + point.value });
    }
    for (const point of readTrafficSeries(clones?.data, "clones", "count")) {
      const current = dailyTraffic.get(point.date) || { views: 0, clones: 0 };
      dailyTraffic.set(point.date, { ...current, clones: current.clones + point.value });
    }

    return {
      ...repository,
      visitors14d: views ? readTrafficNumber(views.data, "uniques") : 0,
      clones14d: clones ? readTrafficNumber(clones.data, "count") : 0
    };
  }));

  return {
    repositories: enrichedRepositories,
    trends: Array.from(dailyTraffic.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, stars: 0, forks: 0, downloads: 0, views: value.views, clones: value.clones }))
  };
}

export async function getRepositoryTrafficDetails(repository: RepositorySummary, options: GitHubClientOptions): Promise<RepositoryTrafficDetails> {
  if (options.mock) return { trends: [], daily: [], popularPaths: [], referrers: [] };

  const client = createGitHubClient(options);
  if (!client) {
    throw new GitHubConfigurationRequiredError();
  }

  const [views, clones, popularPaths, referrers] = await Promise.all([
    client.request("GET /repos/{owner}/{repo}/traffic/views", {
      owner: repository.owner,
      repo: repository.name,
      per: "day"
    }).catch(() => null),
    client.request("GET /repos/{owner}/{repo}/traffic/clones", {
      owner: repository.owner,
      repo: repository.name,
      per: "day"
    }).catch(() => null),
    client.request("GET /repos/{owner}/{repo}/traffic/popular/paths", {
      owner: repository.owner,
      repo: repository.name
    }).catch(() => null),
    client.request("GET /repos/{owner}/{repo}/traffic/popular/referrers", {
      owner: repository.owner,
      repo: repository.name
    }).catch(() => null)
  ]);

  const daily = [
    ...readTrafficDailySeries(views?.data, "views"),
    ...readTrafficDailySeries(clones?.data, "clones")
  ];
  const dailyTraffic = new Map<string, { views: number; clones: number }>();
  for (const point of daily.filter((item) => item.metric === "views")) {
    const current = dailyTraffic.get(point.date) || { views: 0, clones: 0 };
    dailyTraffic.set(point.date, { ...current, views: current.views + point.uniques });
  }
  for (const point of daily.filter((item) => item.metric === "clones")) {
    const current = dailyTraffic.get(point.date) || { views: 0, clones: 0 };
    dailyTraffic.set(point.date, { ...current, clones: current.clones + point.count });
  }

  return {
    trends: Array.from(dailyTraffic.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, stars: 0, forks: 0, downloads: 0, views: value.views, clones: value.clones })),
    daily,
    popularPaths: readPopularPaths(popularPaths?.data),
    referrers: readReferrers(referrers?.data)
  };
}

export async function syncRepositorySkeleton(repository: RepositorySummary, options: GitHubClientOptions): Promise<RepositorySyncResult> {
  const client = createGitHubClient(options);

  if (!client) {
    return {
      repositoryId: repository.id,
      status: "success",
      collectedRepo: true,
      collectedTraffic: true,
      collectedReleases: true
    };
  }

  try {
    await client.rest.repos.get({ owner: repository.owner, repo: repository.name });
    await client.rest.repos.listReleases({ owner: repository.owner, repo: repository.name, per_page: 10 });
  } catch (error) {
    return {
      repositoryId: repository.id,
      status: "failed",
      collectedRepo: false,
      collectedTraffic: false,
      collectedReleases: false,
      errorCode: classifyGitHubError(error),
      errorMessage: error instanceof Error ? error.message : "Unknown GitHub error"
    };
  }

  try {
    await client.request("GET /repos/{owner}/{repo}/traffic/views", {
      owner: repository.owner,
      repo: repository.name,
      per: "day"
    });
  } catch (error) {
    const code = classifyGitHubError(error);
    if (code === "GITHUB_FORBIDDEN") {
      return {
        repositoryId: repository.id,
        status: "partial_failed",
        collectedRepo: true,
        collectedTraffic: false,
        collectedReleases: true,
        errorCode: "TRAFFIC_PERMISSION_MISSING",
        errorMessage: "GitHub returned 403 for traffic; repository metadata and releases remain usable."
      };
    }

    return {
      repositoryId: repository.id,
      status: "partial_failed",
      collectedRepo: true,
      collectedTraffic: false,
      collectedReleases: true,
      errorCode: code,
      errorMessage: error instanceof Error ? error.message : "Traffic collection failed"
    };
  }

  return {
    repositoryId: repository.id,
    status: "success",
    collectedRepo: true,
    collectedTraffic: true,
    collectedReleases: true
  };
}

export async function listReleaseAssetsForRepositories(repositories: RepositorySummary[], options: GitHubClientOptions): Promise<ReleaseAssetSummary[]> {
  if (options.mock) return [];

  const client = createGitHubClient(options);
  if (!client) {
    throw new GitHubConfigurationRequiredError();
  }

  const assets = await Promise.all(repositories.map(async (repository) => {
    const releases = await client.rest.repos.listReleases({ owner: repository.owner, repo: repository.name, per_page: 30 }).catch(() => ({ data: [] }));
    const repositoryAssets: ReleaseAssetSummary[] = [];
    for (const release of releases.data) {
      for (const asset of release.assets || []) {
        repositoryAssets.push({
          id: `github-asset-${asset.id}`,
          githubAssetId: asset.id,
          releaseId: `github-release-${release.id}`,
          githubReleaseId: release.id,
          repositoryId: repository.id,
          repository: repository.name,
          tagName: release.tag_name,
          releaseName: release.name || null,
          releaseHtmlUrl: release.html_url || null,
          releaseCreatedAt: release.created_at || undefined,
          releaseUpdatedAt: release.updated_at || undefined,
          assetName: asset.name,
          assetLabel: asset.label || null,
          assetSize: formatBytes(asset.size || 0),
          assetSizeBytes: asset.size || 0,
          assetContentType: asset.content_type || null,
          assetState: asset.state || null,
          publishedAt: asset.created_at || release.published_at || release.created_at || "",
          assetCreatedAt: asset.created_at || undefined,
          assetUpdatedAt: asset.updated_at || undefined,
          totalDownloads: asset.download_count || 0,
          todayDownloads: 0,
          sevenDayDownloads: 0,
          thirtyDayDownloads: 0,
          status: "Baseline captured",
          browserDownloadUrl: asset.browser_download_url
        });
      }
    }
    return repositoryAssets;
  }));

  return assets.flat();
}

export function maskToken(token: string) {
  if (token.length <= 8) {
    return "github_pat_****";
  }

  return `${token.slice(0, 10)}****${token.slice(-4)}`;
}

function defaultPermissions(note: string) {
  return [
    { name: "Read user profile", ok: true },
    { name: "Read repository metadata", ok: true },
    { name: "Read public repositories", ok: true },
    { name: "Read private repositories if selected", ok: true },
    { name: "Read traffic data", ok: true, note },
    { name: "Read releases and assets", ok: true }
  ];
}

function classifyGitHubError(error: unknown): RepositorySyncResult["errorCode"] {
  const status = typeof error === "object" && error && "status" in error ? Number((error as { status: unknown }).status) : undefined;
  if (status === 401) return "GITHUB_UNAUTHORIZED";
  if (status === 403) return "GITHUB_FORBIDDEN";
  if (status === 429) return "GITHUB_RATE_LIMITED";
  return "UNKNOWN";
}

function readTrafficNumber(data: unknown, preferredKey: "count" | "uniques") {
  if (!data || typeof data !== "object") return 0;
  const summary = data as { count?: unknown; uniques?: unknown };
  const preferredValue = summary[preferredKey];
  if (typeof preferredValue === "number") return preferredValue;
  const fallbackValue = preferredKey === "count" ? summary.uniques : summary.count;
  return typeof fallbackValue === "number" ? fallbackValue : 0;
}

function readTrafficSeries(data: unknown, seriesKey: "views" | "clones", preferredKey: "count" | "uniques") {
  if (!data || typeof data !== "object") return [];
  const series = (data as { views?: unknown; clones?: unknown })[seriesKey];
  if (!Array.isArray(series)) return [];

  return series.flatMap((point) => {
    if (!point || typeof point !== "object") return [];
    const item = point as { timestamp?: unknown; count?: unknown; uniques?: unknown };
    if (typeof item.timestamp !== "string") return [];
    return [{ date: item.timestamp.slice(0, 10), value: readTrafficNumber(item, preferredKey) }];
  });
}

function readTrafficDailySeries(data: unknown, seriesKey: "views" | "clones"): TrafficDailyPoint[] {
  if (!data || typeof data !== "object") return [];
  const series = (data as { views?: unknown; clones?: unknown })[seriesKey];
  if (!Array.isArray(series)) return [];

  return series.flatMap((point) => {
    if (!point || typeof point !== "object") return [];
    const item = point as { timestamp?: unknown; count?: unknown; uniques?: unknown };
    if (typeof item.timestamp !== "string") return [];
    return [{
      date: item.timestamp.slice(0, 10),
      metric: seriesKey,
      count: typeof item.count === "number" ? item.count : 0,
      uniques: typeof item.uniques === "number" ? item.uniques : 0
    }];
  });
}

function readPopularPaths(data: unknown): RepositoryPopularPath[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((value) => {
    if (!value || typeof value !== "object") return [];
    const item = value as { path?: unknown; title?: unknown; count?: unknown; uniques?: unknown };
    if (typeof item.path !== "string") return [];
    return [{
      path: item.path,
      title: typeof item.title === "string" ? item.title : item.path,
      count: typeof item.count === "number" ? item.count : 0,
      uniques: typeof item.uniques === "number" ? item.uniques : 0
    }];
  });
}

function readReferrers(data: unknown): RepositoryReferrer[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((value) => {
    if (!value || typeof value !== "object") return [];
    const item = value as { referrer?: unknown; count?: unknown; uniques?: unknown };
    if (typeof item.referrer !== "string") return [];
    return [{
      referrer: item.referrer,
      count: typeof item.count === "number" ? item.count : 0,
      uniques: typeof item.uniques === "number" ? item.uniques : 0
    }];
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
