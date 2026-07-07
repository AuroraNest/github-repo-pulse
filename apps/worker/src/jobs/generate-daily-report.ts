import { generateDailyReport, mockOverview, mockReleaseAssets, mockRepositories, readRuntimeConfig } from "@repopulse/core";

export function runGenerateDailyReport(date = new Date().toISOString().slice(0, 10)) {
  const config = readRuntimeConfig();
  return generateDailyReport({
    date,
    overview: mockOverview,
    repositories: mockRepositories,
    assets: mockReleaseAssets,
    aiEnabled: config.aiEnabled
  });
}
