import { mockReports } from "@repopulse/core";
import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "../../../../lib/api";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const report = mockReports.find((item) => item.id === id);
  if (!report) {
    return jsonError("NOT_FOUND", "Report not found.", 404);
  }

  return jsonOk({ report });
}
