import { readRuntimeConfig, verifyGitHubToken } from "@repopulse/core";
import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "../../../../../lib/api";
import { getGitHubDataSource, isGitHubConfigurationRequired } from "../../../../../lib/data-source";
import { requireSession } from "../../../../../lib/session";

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const config = readRuntimeConfig();
  const source = await getGitHubDataSource();
  if (isGitHubConfigurationRequired(source)) {
    return jsonError("GITHUB_CONFIGURATION_REQUIRED", source.message, 409);
  }

  return jsonOk(await verifyGitHubToken({
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    mock: config.mockGitHub
  }));
}
