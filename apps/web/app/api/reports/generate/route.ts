import { generateDailyReport, readRuntimeConfig } from "@repopulse/core";
import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk } from "../../../../lib/api";
import { getReportGenerationData, isGitHubConfigurationRequired } from "../../../../lib/data-source";

const generateSchema = z.object({
  type: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  date: z.string().default(new Date().toISOString().slice(0, 10)),
  useAI: z.boolean().default(false)
});

export async function POST(request: NextRequest) {
  const body = generateSchema.safeParse(await request.json());
  if (!body.success) {
    return jsonError("VALIDATION_ERROR", "Report generation payload is invalid.", 400, body.error.flatten());
  }

  const config = readRuntimeConfig();
  const reportData = await getReportGenerationData();
  if (isGitHubConfigurationRequired(reportData.source)) {
    return jsonError("GITHUB_CONFIGURATION_REQUIRED", reportData.source.message, 409);
  }

  const report = generateDailyReport({
    date: body.data.date,
    overview: reportData.overview,
    repositories: reportData.repositories,
    assets: reportData.assets,
    aiEnabled: body.data.useAI && config.aiEnabled
  });

  return jsonOk({ report });
}
