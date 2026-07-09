import { readRuntimeConfig, syncRepositorySkeleton } from "@repopulse/core";
import { saveSyncRun } from "@repopulse/db";
import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk } from "../../../../lib/api";
import { getRepositoryCollection, isGitHubConfigurationRequired } from "../../../../lib/data-source";
import { captureRepositoryMetricSnapshot } from "../../../../lib/metric-snapshots";
import { readGitHubRuntimeConfig } from "../../../../lib/runtime-github-token";
import { requireSession } from "../../../../lib/session";

const syncSchema = z.object({
  scope: z.enum(["all", "repository"]).default("all"),
  repositoryId: z.string().optional()
});

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const body = syncSchema.safeParse(await request.json());
  if (!body.success) {
    return jsonError("VALIDATION_ERROR", "Sync payload is invalid.", 400, body.error.flatten());
  }

  const config = await readGitHubRuntimeConfig();
  const { source, repositories: allRepositories } = await getRepositoryCollection();
  if (isGitHubConfigurationRequired(source)) {
    return jsonError("GITHUB_CONFIGURATION_REQUIRED", source.message, 409);
  }

  const repositories = body.data.scope === "repository"
    ? allRepositories.filter((repo) => repo.id === body.data.repositoryId)
    : allRepositories.filter((repo) => repo.tracked);

  const runId = `sync-${Date.now()}`;
  const startedAt = new Date().toISOString();
  const databaseEnabled = Boolean(readRuntimeConfig().databaseUrl);
  const items = [];
  for (const [index, repository] of repositories.entries()) {
    const itemStartedAt = new Date().toISOString();
    const result = await syncRepositorySkeleton(repository, {
      token: config.githubToken,
      baseUrl: config.githubApiBaseUrl,
      mock: config.mockGitHub
    });
    if (databaseEnabled && result.collectedRepo && !config.mockGitHub) {
      await captureRepositoryMetricSnapshot(repository);
    }
    items.push({ ...result, id: `${runId}-${index}`, startedAt: itemStartedAt, finishedAt: new Date().toISOString() });
  }
  const status = items.some((item) => item.status === "failed")
    ? "failed"
    : items.some((item) => item.status !== "success") ? "partial_failed" : "success";
  const finishedAt = new Date().toISOString();
  if (databaseEnabled) {
    await saveSyncRun({
      id: runId,
      trigger: "api",
      status,
      startedAt,
      finishedAt,
      totalRepositories: repositories.length,
      successCount: items.filter((item) => item.status === "success").length,
      failedCount: items.filter((item) => item.status !== "success").length,
      items: items.map((item) => ({
        id: item.id,
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
  }

  return jsonOk({
    syncRun: {
      id: runId,
      status,
      items
    }
  });
}
