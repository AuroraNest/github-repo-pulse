import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "../../../../lib/api";
import { getReportData, isGitHubConfigurationRequired } from "../../../../lib/data-source";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { source, reports } = await getReportData();
  if (isGitHubConfigurationRequired(source)) {
    return jsonError("GITHUB_CONFIGURATION_REQUIRED", source.message, 409);
  }

  const report = reports.find((item) => item.id === id);
  if (!report) {
    return jsonError("NOT_FOUND", "Report not found.", 404);
  }

  return jsonOk({ report });
}
