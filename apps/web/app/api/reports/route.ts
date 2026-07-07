import { mockReports } from "@repopulse/core";
import { NextRequest } from "next/server";
import { jsonOk, parseSearchParams } from "../../../lib/api";

export async function GET(request: NextRequest) {
  const params = parseSearchParams(request);
  const type = params.get("type") || "daily";

  return jsonOk({
    reports: mockReports.filter((report) => report.type === type),
    page: Number(params.get("page") || 1),
    pageSize: Number(params.get("pageSize") || 20)
  });
}
