import { NextRequest } from "next/server";
import { jsonError } from "../../../../../lib/api";
import { getReportData, isGitHubConfigurationRequired } from "../../../../../lib/data-source";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { source, reports } = getReportData();
  if (isGitHubConfigurationRequired(source)) {
    return jsonError("GITHUB_CONFIGURATION_REQUIRED", source.message, 409);
  }

  const report = reports.find((item) => item.id === id);
  if (!report) {
    return jsonError("NOT_FOUND", "Report not found.", 404);
  }

  const format = new URL(request.url).searchParams.get("format") || "markdown";
  if (format === "json") {
    return Response.json(report);
  }
  if (format === "csv") {
    const csv = ["Metric,Value,Change", ...report.kpis.map((item) => `${item.label},${item.value},${item.change}`)].join("\n");
    return new Response(csv, { headers: { "content-type": "text/csv" } });
  }
  if (format !== "markdown") {
    return jsonError("UNSUPPORTED_FORMAT", "Supported formats are markdown, json, and csv.", 400);
  }

  return new Response(report.markdown, { headers: { "content-type": "text/markdown" } });
}
