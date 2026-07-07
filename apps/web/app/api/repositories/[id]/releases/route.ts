import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "../../../../../lib/api";
import { getReleaseData, getRepositoryData, isGitHubConfigurationRequired } from "../../../../../lib/data-source";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { source, repository } = await getRepositoryData(id);
  if (isGitHubConfigurationRequired(source)) {
    return jsonError("GITHUB_CONFIGURATION_REQUIRED", source.message, 409);
  }

  if (!repository) {
    return jsonError("NOT_FOUND", "Repository not found.", 404);
  }

  const { assets } = getReleaseData();
  return jsonOk({
    repository,
    assets: assets.filter((asset) => asset.repositoryId === repository.id)
  });
}
