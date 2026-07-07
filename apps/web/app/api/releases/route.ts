import { mockOverview, mockReleaseAssets } from "@repopulse/core";
import { jsonOk } from "../../../lib/api";

export async function GET() {
  const mostDownloadedAsset = [...mockReleaseAssets].sort((a, b) => b.totalDownloads - a.totalDownloads)[0];

  return jsonOk({
    kpis: {
      totalReleaseDownloads: mockOverview.kpis.totalDownloads,
      downloadsToday: mockOverview.kpis.downloadsToday,
      activeReleases: mockReleaseAssets.length,
      mostDownloadedAsset: {
        name: mostDownloadedAsset.assetName,
        downloads: mostDownloadedAsset.totalDownloads
      }
    },
    cumulativeDownloads: mockOverview.growthTrends,
    dailyDownloadsByRepository: mockOverview.growthTrends,
    assets: mockReleaseAssets,
    topAssets: mockReleaseAssets,
    recentActivity: mockOverview.activityFeed
  });
}
