import { findRepository, mockRepositories, readRuntimeConfig, syncRepositorySkeleton } from "@repopulse/core";

export async function runSyncOneRepository(repositoryId: string) {
  const repository = findRepository(mockRepositories, repositoryId);
  if (!repository) {
    throw new Error(`Repository not found: ${repositoryId}`);
  }

  const config = readRuntimeConfig();
  return syncRepositorySkeleton(repository, {
    token: config.githubToken,
    baseUrl: config.githubApiBaseUrl,
    mock: config.mockGitHub
  });
}
