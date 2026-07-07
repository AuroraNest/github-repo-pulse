import { readSyncRunWithItems } from "@repopulse/db";
import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "../../../../../lib/api";
import { getGitHubDataSource, isGitHubConfigurationRequired } from "../../../../../lib/data-source";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const source = await getGitHubDataSource();
  if (isGitHubConfigurationRequired(source)) {
    return jsonError("GITHUB_CONFIGURATION_REQUIRED", source.message, 409);
  }

  const result = await readSyncRunWithItems(id).catch(() => null);
  if (!result) {
    return jsonError("NOT_FOUND", "Sync run not found.", 404);
  }

  return jsonOk({ run: result.run, items: result.items });
}
