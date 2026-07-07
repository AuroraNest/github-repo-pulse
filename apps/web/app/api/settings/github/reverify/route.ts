import { readRuntimeConfig, verifyGitHubToken } from "@repopulse/core";
import { NextRequest } from "next/server";
import { jsonOk } from "../../../../../lib/api";
import { requireSession } from "../../../../../lib/session";

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const config = readRuntimeConfig();
  return jsonOk(await verifyGitHubToken({
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    mock: config.mockGitHub
  }));
}
