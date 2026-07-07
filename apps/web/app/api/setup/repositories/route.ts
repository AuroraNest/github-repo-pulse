import { NextRequest } from "next/server";
import { jsonOk, parseSearchParams } from "../../../../lib/api";
import { getRepositoryCollection, githubDataSourcePayload } from "../../../../lib/data-source";

export async function GET(request: NextRequest) {
  const params = parseSearchParams(request);
  const search = (params.get("search") || "").toLowerCase();
  const visibility = params.get("visibility") || "all";
  const { source, repositories } = await getRepositoryCollection();

  return jsonOk({
    github: githubDataSourcePayload(source),
    repositories: repositories.filter((repo) => {
      const matchesSearch = !search || repo.fullName.toLowerCase().includes(search);
      const matchesVisibility = visibility === "all" || repo.visibility === visibility;
      return matchesSearch && matchesVisibility;
    }),
    page: Number(params.get("page") || 1),
    pageSize: Number(params.get("pageSize") || 50)
  });
}
