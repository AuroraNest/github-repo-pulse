import { readRuntimeConfig, syncRepositorySkeleton } from "@repopulse/core";
import { saveSyncRun } from "@repopulse/db";
import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "../../../../../lib/api";
import { getRepositoryData, isGitHubConfigurationRequired } from "../../../../../lib/data-source";
import { captureRepositoryMetricSnapshot } from "../../../../../lib/metric-snapshots";
import { readGitHubRuntimeConfig } from "../../../../../lib/runtime-github-token";
import { requireSession } from "../../../../../lib/session";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function POST(request: NextRequest, context: RouteContext) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const { id } = await context.params;
  const { source, repository } = await getRepositoryData(id);
  if (isGitHubConfigurationRequired(source)) {
    return jsonError("GITHUB_CONFIGURATION_REQUIRED", source.message, 409);
  }

  if (!repository) {
    return jsonError("NOT_FOUND", "Repository not found.", 404);
  }

  const config = await readGitHubRuntimeConfig();
  const runId = `sync-${Date.now()}`;
  const startedAt = new Date().toISOString();
  const itemStartedAt = new Date().toISOString();
  const result = await syncRepositorySkeleton(repository, {
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    mock: config.mockGitHub
  });
  const databaseEnabled = Boolean(readRuntimeConfig().databaseUrl);
  if (databaseEnabled && result.collectedRepo && !config.mockGitHub) {
    await captureRepositoryMetricSnapshot(repository);
  }
  const finishedAt = new Date().toISOString();
  if (databaseEnabled) {
    await saveSyncRun({
      id: runId,
      trigger: "api",
      status: result.status,
      startedAt,
      finishedAt,
      totalRepositories: 1,
      successCount: result.status === "success" ? 1 : 0,
      failedCount: result.status === "success" ? 0 : 1,
      items: [{
        id: `${runId}-0`,
        repositoryId: result.repositoryId,
        status: result.status,
        startedAt: itemStartedAt,
        finishedAt,
        collectedRepo: result.collectedRepo,
        collectedTraffic: result.collectedTraffic,
        collectedReleases: result.collectedReleases,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage
      }]
    });
  }

  return jsonOk({ syncRunItem: result });
}
