import {
  decryptAes256Gcm,
  getRepositoryTrafficDetails,
  listAccessibleRepositories,
  listReleaseAssetsForRepositories,
  readRuntimeConfig,
  syncRepositorySkeleton,
  type RepositorySummary,
  type RepositorySyncResult
} from "@repopulse/core";
import {
  readGitHubConnection,
  readTrackedRepositoryIds,
  saveRepositoryMetricSnapshots,
  saveSyncRun
} from "@repopulse/db";

type SyncTrigger = "schedule" | "manual" | "setup" | "api";

export async function runSyncAllRepositories(trigger: SyncTrigger) {
  const id = `sync-${Date.now()}`;
  const startedAt = new Date().toISOString();
  let items: Array<RepositorySyncResult & { startedAt: string; finishedAt: string }> = [];
  let errorMessage: string | undefined;

  try {
    const config = readRuntimeConfig();
    const token = await readGitHubToken();
    const githubOptions = {
      token,
      baseUrl: config.githubApiBaseUrl,
      mock: config.mockGitHub
    };
    const repositories = await listAccessibleRepositories(githubOptions);
    const trackedIds = await readTrackedRepositoryIds();
    const trackedRepositories = trackedIds.size > 0
      ? repositories.filter((repository) => trackedIds.has(repository.id))
      : repositories;
    const snapshots: Array<{
      repository: RepositorySummary;
      traffic: Awaited<ReturnType<typeof getRepositoryTrafficDetails>>;
      assets: Awaited<ReturnType<typeof listReleaseAssetsForRepositories>>;
    }> = [];

    items = await mapWithConcurrency(
      trackedRepositories,
      config.syncConcurrency,
      async (repository) => {
        const itemStartedAt = new Date().toISOString();
        const result = await syncRepositorySkeleton(repository, githubOptions);
        if (result.collectedRepo) {
          const [traffic, assets] = await Promise.all([
            result.collectedTraffic
              ? getRepositoryTrafficDetails(repository, githubOptions)
              : Promise.resolve({ trends: [], daily: [], popularPaths: [], referrers: [] }),
            result.collectedReleases
              ? listReleaseAssetsForRepositories([repository], githubOptions)
              : Promise.resolve([])
          ]);
          snapshots.push({ repository, traffic, assets });
        }
        return { ...result, startedAt: itemStartedAt, finishedAt: new Date().toISOString() };
      }
    );

    if (snapshots.length > 0) {
      await saveRepositoryMetricSnapshots({ repositories: snapshots });
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Scheduled sync failed";
  }

  const finishedAt = new Date().toISOString();
  const failedCount = items.filter((item) => item.status !== "success").length;
  const status: "success" | "partial_failed" | "failed" = errorMessage
    ? "failed"
    : failedCount > 0
      ? "partial_failed"
      : "success";
  const result = {
    id,
    trigger,
    status,
    totalRepositories: items.length,
    successCount: items.length - failedCount,
    failedCount: errorMessage ? Math.max(1, failedCount) : failedCount,
    errorMessage,
    items
  };

  await saveSyncRun({
    ...result,
    startedAt,
    finishedAt,
    items: items.map((item) => ({
      id: `${id}-${item.repositoryId}`,
      repositoryId: item.repositoryId,
      status: item.status,
      startedAt: item.startedAt,
      finishedAt: item.finishedAt,
      collectedRepo: item.collectedRepo,
      collectedTraffic: item.collectedTraffic,
      collectedReleases: item.collectedReleases,
      errorCode: item.errorCode,
      errorMessage: item.errorMessage
    }))
  });

  return result;
}

async function readGitHubToken() {
  const config = readRuntimeConfig();
  if (config.mockGitHub || config.githubToken) return config.githubToken || "";

  const connection = await readGitHubConnection();
  if (!connection) {
    throw new Error("GitHub token is not configured.");
  }

  return decryptAes256Gcm({
    ciphertext: connection.encryptedToken,
    iv: connection.iv,
    authTag: connection.authTag
  }, config.sessionSecret);
}

async function mapWithConcurrency<T, R>(items: T[], configuredLimit: number, callback: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  const limit = Math.max(1, Math.min(10, Math.floor(configuredLimit) || 1));
  let nextIndex = 0;

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await callback(items[index]);
    }
  }));

  return results;
}
