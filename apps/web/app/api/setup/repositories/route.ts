import { listAccessibleRepositories, readRuntimeConfig } from "@repopulse/core";
import { NextRequest } from "next/server";
import { jsonOk, parseSearchParams } from "../../../../lib/api";

export async function GET(request: NextRequest) {
  const params = parseSearchParams(request);
  const config = readRuntimeConfig();
  const search = (params.get("search") || "").toLowerCase();
  const visibility = params.get("visibility") || "all";
  const repositories = await listAccessibleRepositories({
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    mock: config.mockGitHub
  });

  return jsonOk({
    repositories: repositories.filter((repo) => {
      const matchesSearch = !search || repo.fullName.toLowerCase().includes(search);
      const matchesVisibility = visibility === "all" || repo.visibility === visibility;
      return matchesSearch && matchesVisibility;
    }),
    page: Number(params.get("page") || 1),
    pageSize: Number(params.get("pageSize") || 50)
  });
}
