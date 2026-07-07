import { NextRequest } from "next/server";
import { jsonOk, parseSearchParams } from "../../../lib/api";
import { getReportData, githubDataSourcePayload } from "../../../lib/data-source";

export async function GET(request: NextRequest) {
  const params = parseSearchParams(request);
  const type = params.get("type") || "daily";
  const { source, reports: allReports } = await getReportData();

  return jsonOk({
    github: githubDataSourcePayload(source),
    reports: allReports.filter((report) => report.type === type),
    page: Number(params.get("page") || 1),
    pageSize: Number(params.get("pageSize") || 20)
  });
}
