import { mockRepositories, readRuntimeConfig, syncRepositorySkeleton } from "@repopulse/core";

export async function runSyncAllRepositories(trigger: "schedule" | "manual" | "setup" | "api") {
  const config = readRuntimeConfig();
  const results = [];

  for (const repository of mockRepositories.filter((repo) => repo.tracked)) {
    const result = await syncRepositorySkeleton(repository, {
      token: config.githubToken,
      baseUrl: config.githubApiBaseUrl,
      mock: config.mockGitHub
    });
    results.push(result);
  }

  return {
    id: `sync-${Date.now()}`,
    trigger,
    status: results.some((item) => item.status !== "success") ? "partial_failed" : "success",
    totalRepositories: results.length,
    successCount: results.filter((item) => item.status === "success").length,
    failedCount: results.filter((item) => item.status !== "success").length,
    items: results
  };
}
