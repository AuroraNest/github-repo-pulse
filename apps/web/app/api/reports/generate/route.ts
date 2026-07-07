import { generateDailyReport, mockOverview, mockReleaseAssets, mockRepositories, readRuntimeConfig } from "@repopulse/core";
import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk } from "../../../../lib/api";
import { requireSession } from "../../../../lib/session";

const generateSchema = z.object({
  type: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  date: z.string().default(new Date().toISOString().slice(0, 10)),
  useAI: z.boolean().default(false)
});

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const body = generateSchema.safeParse(await request.json());
  if (!body.success) {
    return jsonError("VALIDATION_ERROR", "Report generation payload is invalid.", 400, body.error.flatten());
  }

  const config = readRuntimeConfig();
  const report = generateDailyReport({
    date: body.data.date,
    overview: mockOverview,
    repositories: mockRepositories,
    assets: mockReleaseAssets,
    aiEnabled: body.data.useAI && config.aiEnabled
  });

  return jsonOk({ report });
}
