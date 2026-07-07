import { jsonOk } from "../../../lib/api";
import { getReleaseData, githubDataSourcePayload } from "../../../lib/data-source";

export async function GET() {
  const { source, assets, overview } = await getReleaseData();
  const mostDownloadedAsset = [...assets].sort((a, b) => b.totalDownloads - a.totalDownloads)[0];

  return jsonOk({
    github: githubDataSourcePayload(source),
    kpis: {
      totalReleaseDownloads: overview.kpis.totalDownloads,
      downloadsToday: overview.kpis.downloadsToday,
      activeReleases: assets.length,
      mostDownloadedAsset: mostDownloadedAsset ? {
        name: mostDownloadedAsset.assetName,
        downloads: mostDownloadedAsset.totalDownloads
      } : null
    },
    cumulativeDownloads: overview.growthTrends,
    dailyDownloadsByRepository: overview.growthTrends,
    assets,
    topAssets: assets,
    recentActivity: overview.activityFeed
  });
}
