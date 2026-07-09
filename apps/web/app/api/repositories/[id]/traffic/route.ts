import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "../../../../../lib/api";
import { getRepositoryData, getRepositoryTrafficTrends, isGitHubConfigurationRequired } from "../../../../../lib/data-source";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { source, repository } = await getRepositoryData(id);
  if (isGitHubConfigurationRequired(source)) {
    return jsonError("GITHUB_CONFIGURATION_REQUIRED", source.message, 409);
  }

  if (!repository) {
    return jsonError("NOT_FOUND", "Repository not found.", 404);
  }

  const trafficTrends = await getRepositoryTrafficTrends(repository);

  return jsonOk({
    daily: trafficTrends.map((point) => ({
      date: point.date,
      views: point.views,
      uniqueVisitors: point.views,
      clones: point.clones,
      uniqueCloners: point.clones
    })),
    popularPaths: source.demo ? ["/", "/releases", `/releases/tag/${repository.latestRelease}`] : [],
    referrers: source.demo ? ["github.com", "google.com", "direct/bookmark"] : [],
    conversion: source.demo ? {
      visitors: repository.visitors14d,
      releasePageViews: Math.round(repository.visitors14d * 0.28),
      downloads: repository.todayDownloads * 7
    } : null
  });
}
