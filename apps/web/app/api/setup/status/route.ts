import { NextRequest } from "next/server";
import { jsonOk } from "../../../../lib/api";
import { getRepositoryCollection, githubDataSourcePayload } from "../../../../lib/data-source";
import { getRuntimeSetupState } from "../../../../lib/runtime-setup-state";
import { requireSession } from "../../../../lib/session";

export async function GET(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const { source, repositories } = await getRepositoryCollection();
  const setup = await getRuntimeSetupState();

  return jsonOk({
    github: githubDataSourcePayload(source),
    setupCompleted: setup.completed,
    hasGitHubConnection: source.configured,
    trackedRepositoriesCount: repositories.filter((repo) => repo.tracked).length
  });
}
