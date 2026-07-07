import { Octokit } from "@octokit/rest";
import { mockRepositories } from "../mock-data";
import type { RepositorySummary } from "../types";

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
