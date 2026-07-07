import { mockSyncRuns } from "@repopulse/core";
import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "../../../../../lib/api";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const run = mockSyncRuns.find((item) => item.id === id);
  if (!run) {
    return jsonError("NOT_FOUND", "Sync run not found.", 404);
  }

  return jsonOk({ run, items: [] });
}
