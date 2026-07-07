import { syncRepositorySkeleton } from "@repopulse/core";
import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "../../../../../lib/api";
import { getRepositoryData, isGitHubConfigurationRequired } from "../../../../../lib/data-source";
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
  const result = await syncRepositorySkeleton(repository, {
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    mock: config.mockGitHub
  });

  return jsonOk({ syncRunItem: result });
}
