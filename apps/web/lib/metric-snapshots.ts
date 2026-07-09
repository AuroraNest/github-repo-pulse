import type { RepositorySummary } from "@repopulse/core";
import { saveRepositoryMetricSnapshots } from "@repopulse/db";
import { getRepositoryReleaseAssets, getRepositoryTrafficData } from "./data-source";

export async function captureRepositoryMetricSnapshot(repository: RepositorySummary) {
  const [traffic, assets] = await Promise.all([
    getRepositoryTrafficData(repository),
    getRepositoryReleaseAssets(repository)
  ]);

  await saveRepositoryMetricSnapshots({
    repositories: [{
      repository,
      traffic,
      assets
    }]
  });
}
