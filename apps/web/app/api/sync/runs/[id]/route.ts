import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "../../../../../lib/api";
import { getSyncRunData, isGitHubConfigurationRequired } from "../../../../../lib/data-source";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { source, runs } = await getSyncRunData();
  if (isGitHubConfigurationRequired(source)) {
    return jsonError("GITHUB_CONFIGURATION_REQUIRED", source.message, 409);
  }

  const run = runs.find((item) => item.id === id);
  if (!run) {
    return jsonError("NOT_FOUND", "Sync run not found.", 404);
  }

  return jsonOk({ run, items: [] });
}
