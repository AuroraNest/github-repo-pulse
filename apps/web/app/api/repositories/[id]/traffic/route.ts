import { findRepository, mockOverview, mockRepositories } from "@repopulse/core";
import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "../../../../../lib/api";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const repository = findRepository(mockRepositories, id);
  if (!repository) {
    return jsonError("NOT_FOUND", "Repository not found.", 404);
  }

  return jsonOk({
    daily: mockOverview.viewsVsClones.map((point) => ({
      date: point.date,
      views: point.views,
      uniqueVisitors: Math.round(point.views * 0.72),
      clones: point.clones,
      uniqueCloners: Math.round(point.clones * 0.66)
    })),
    popularPaths: ["/", "/releases", `/releases/tag/${repository.latestRelease}`],
    referrers: ["github.com", "google.com", "direct/bookmark"],
    conversion: {
      visitors: repository.visitors14d,
      releasePageViews: Math.round(repository.visitors14d * 0.28),
      downloads: repository.todayDownloads * 7
    }
  });
}
