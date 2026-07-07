import { findRepository, mockRepositories, readRuntimeConfig, syncRepositorySkeleton } from "@repopulse/core";
import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "../../../../../lib/api";
import { requireSession } from "../../../../../lib/session";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function POST(request: NextRequest, context: RouteContext) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const { id } = await context.params;
  const repository = findRepository(mockRepositories, id);
  if (!repository) {
    return jsonError("NOT_FOUND", "Repository not found.", 404);
  }

  const config = readRuntimeConfig();
  const result = await syncRepositorySkeleton(repository, {
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    mock: config.mockGitHub
  });

  return jsonOk({ syncRunItem: result });
}
