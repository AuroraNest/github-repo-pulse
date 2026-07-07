import { mockRepositories } from "@repopulse/core";
import { jsonOk } from "../../../../lib/api";

export async function GET() {
  return jsonOk({
    setupCompleted: true,
    hasGitHubConnection: true,
    trackedRepositoriesCount: mockRepositories.filter((repo) => repo.tracked).length
  });
}
