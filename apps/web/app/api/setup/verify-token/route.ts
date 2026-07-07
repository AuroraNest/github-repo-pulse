import { readRuntimeConfig, verifyGitHubToken } from "@repopulse/core";
import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk } from "../../../../lib/api";
import { persistVerifiedGitHubToken } from "../../../../lib/github-connection";
import { setRuntimeGitHubToken } from "../../../../lib/runtime-github-token";
import { requireSession } from "../../../../lib/session";

const verifySchema = z.object({
  token: z.string().min(8)
});

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const body = verifySchema.safeParse(await request.json());
  if (!body.success) {
    return jsonError("VALIDATION_ERROR", "GitHub token is required.", 400, body.error.flatten());
  }

  const config = readRuntimeConfig();
  const result = await verifyGitHubToken({
    token: body.data.token,
    baseUrl: config.githubApiBaseUrl,
    mock: config.mockGitHub
  }).catch(() => null);

  if (!result) {
    return jsonError("GITHUB_TOKEN_INVALID", "GitHub token verification failed.", 401);
  }

  try {
    await persistVerifiedGitHubToken(body.data.token, result);
  } catch {
    return jsonError("DATABASE_PERSISTENCE_FAILED", "GitHub token was verified but could not be saved.", 500);
  }

  setRuntimeGitHubToken(body.data.token);

  return jsonOk(result);
}
