import { verifyGitHubToken } from "@repopulse/core";
import { jsonError, jsonOk } from "../../../../../lib/api";
import { getGitHubDataSource, isGitHubConfigurationRequired } from "../../../../../lib/data-source";
import { persistVerifiedGitHubToken } from "../../../../../lib/github-connection";
import { readGitHubRuntimeConfig } from "../../../../../lib/runtime-github-token";
import { requireSession } from "../../../../../lib/session";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

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

  if (config.githubToken) {
    try {
      await persistVerifiedGitHubToken(config.githubToken, result);
    } catch {
      return jsonError("DATABASE_PERSISTENCE_FAILED", "GitHub token was verified but could not be saved.", 500);
    }
  }

  return jsonOk(result);
}
