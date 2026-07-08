import { NextRequest } from "next/server";
import { jsonOk, parseSearchParams } from "../../../lib/api";
import { getRepositoryCollection, githubDataSourcePayload } from "../../../lib/data-source";

export async function GET(request: NextRequest) {
  const params = parseSearchParams(request);
  const { source, repositories: allRepositories } = await getRepositoryCollection({ includeMetrics: true });
  const search = (params.get("search") || "").toLowerCase();
  const visibility = params.get("visibility") || "all";
  const tracked = params.get("tracked");
  const language = params.get("language");

  const repositories = allRepositories.filter((repo) => {
    if (search && !repo.fullName.toLowerCase().includes(search)) return false;
    if (visibility !== "all" && repo.visibility !== visibility) return false;
    if (tracked !== null && repo.tracked !== (tracked === "true")) return false;
    if (language && repo.primaryLanguage !== language) return false;
    return true;
  });

  return jsonOk({
    github: githubDataSourcePayload(source),
    repositories,
    page: Number(params.get("page") || 1),
    pageSize: Number(params.get("pageSize") || 25),
    total: repositories.length
  });
}
