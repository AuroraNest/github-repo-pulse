import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "../../../../../lib/api";
import { getReleaseData, getRepositoryData, isGitHubConfigurationRequired } from "../../../../../lib/data-source";

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

  const { overview } = await getReleaseData();

  return jsonOk({
    daily: overview.viewsVsClones.map((point) => ({
      date: point.date,
      views: point.views,
      uniqueVisitors: Math.round(point.views * 0.72),
      clones: point.clones,
      uniqueCloners: Math.round(point.clones * 0.66)
    })),
    popularPaths: source.demo ? ["/", "/releases", `/releases/tag/${repository.latestRelease}`] : [],
    referrers: source.demo ? ["github.com", "google.com", "direct/bookmark"] : [],
    conversion: {
      visitors: repository.visitors14d,
      releasePageViews: Math.round(repository.visitors14d * 0.28),
      downloads: repository.todayDownloads * 7
    }
  });
}
