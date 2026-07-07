import { jsonOk } from "../../../../lib/api";
import { getRepositoryCollection, githubDataSourcePayload } from "../../../../lib/data-source";
import { getRuntimeSetupState } from "../../../../lib/runtime-setup-state";

export async function GET() {
  const { source, repositories } = await getRepositoryCollection();
  const setup = await getRuntimeSetupState();

  return jsonOk({
    github: githubDataSourcePayload(source),
    setupCompleted: setup.completed,
    hasGitHubConnection: source.configured,
    trackedRepositoriesCount: repositories.filter((repo) => repo.tracked).length
  });
}
