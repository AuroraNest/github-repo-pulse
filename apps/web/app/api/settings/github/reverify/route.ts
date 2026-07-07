import { verifyGitHubToken } from "@repopulse/core";
import { jsonError, jsonOk } from "../../../../../lib/api";
import { getGitHubDataSource, isGitHubConfigurationRequired } from "../../../../../lib/data-source";
import { readGitHubRuntimeConfig } from "../../../../../lib/runtime-github-token";

export async function POST() {
  const config = await readGitHubRuntimeConfig();
  const source = await getGitHubDataSource();
  if (isGitHubConfigurationRequired(source)) {
    return jsonError("GITHUB_CONFIGURATION_REQUIRED", source.message, 409);
  }

  const result = await verifyGitHubToken({
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    mock: config.mockGitHub
  }).catch(() => null);

  if (!result) {
    return jsonError("GITHUB_TOKEN_INVALID", "GitHub token verification failed.", 401);
  }

  return jsonOk(result);
}
