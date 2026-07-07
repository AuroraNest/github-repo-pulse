import { readRuntimeConfig, verifyGitHubToken } from "@repopulse/core";
import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk } from "../../../../lib/api";

const verifySchema = z.object({
  token: z.string().min(8)
});

export async function POST(request: NextRequest) {
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

  return jsonOk(result);
}
