import { jsonOk } from "../../../../lib/api";
import { getRepositoryCollection, githubDataSourcePayload } from "../../../../lib/data-source";

export async function GET() {
  const { source, repositories } = await getRepositoryCollection();

  return jsonOk({
    github: githubDataSourcePayload(source),
    setupCompleted: source.configured,
    hasGitHubConnection: source.configured,
    trackedRepositoriesCount: repositories.filter((repo) => repo.tracked).length
  });
}
