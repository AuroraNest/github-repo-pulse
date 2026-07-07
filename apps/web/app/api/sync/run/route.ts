import { readRuntimeConfig, syncRepositorySkeleton } from "@repopulse/core";
import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk } from "../../../../lib/api";
import { getRepositoryCollection, isGitHubConfigurationRequired } from "../../../../lib/data-source";
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

  const config = readRuntimeConfig();
  const { source, repositories: allRepositories } = await getRepositoryCollection();
  if (isGitHubConfigurationRequired(source)) {
    return jsonError("GITHUB_CONFIGURATION_REQUIRED", source.message, 409);
  }

  const repositories = body.data.scope === "repository"
    ? allRepositories.filter((repo) => repo.id === body.data.repositoryId)
    : allRepositories.filter((repo) => repo.tracked);

  const items = [];
  for (const repository of repositories) {
    items.push(await syncRepositorySkeleton(repository, {
      token: config.githubToken,
      baseUrl: config.githubApiBaseUrl,
      mock: config.mockGitHub
    }));
  }

  return jsonOk({
    syncRun: {
      id: `sync-${Date.now()}`,
      status: items.some((item) => item.status !== "success") ? "partial_failed" : "success",
      items
    }
  });
}
