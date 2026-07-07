import type { ReleaseAssetSummary, RepositorySummary } from "../types";

export function summarizeRepositories(repositories: RepositorySummary[], assets: ReleaseAssetSummary[]) {
  return {
    totalStars: repositories.reduce((sum, repo) => sum + repo.stars, 0),
    totalForks: repositories.reduce((sum, repo) => sum + repo.forks, 0),
    totalDownloads: assets.reduce((sum, asset) => sum + asset.totalDownloads, 0),
    downloadsToday: assets.reduce((sum, asset) => sum + asset.todayDownloads, 0),
    trackedRepositories: repositories.filter((repo) => repo.tracked).length
  };
}

export function findRepository(repositories: RepositorySummary[], id: string) {
  return repositories.find((repo) => repo.id === id || repo.fullName === id || repo.name === id);
}
