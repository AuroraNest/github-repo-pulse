import { readRuntimeConfig } from "@repopulse/core";
import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk } from "../../../lib/api";
import { requireSession } from "../../../lib/session";

const settingsSchema = z.object({
  syncEnabled: z.boolean().optional(),
  syncCron: z.string().optional(),
  syncTimezone: z.string().optional(),
  aiEnabled: z.boolean().optional()
});

export async function GET(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const config = readRuntimeConfig();
  return jsonOk({
    sync: {
      enabled: true,
      cron: "0 8 * * *",
      timezone: "UTC",
      concurrency: config.syncConcurrency
    },
    retention: { dataRetentionDays: 365 },
    github: {
      connected: true,
      accountLogin: "MockGitHubUser",
      tokenMask: "github_pat_****mock",
      rateLimit: { remaining: 4990, limit: 5000 }
    },
    ai: {
      enabled: config.aiEnabled,
      provider: "OpenAI-compatible",
      model: process.env.AI_MODEL || null
    },
    database: {
      provider: "mysql",
      configured: Boolean(config.databaseUrl),
      status: config.databaseUrl ? "configured" : "placeholder"
    },
    worker: {
      heartbeat: "mock-ready",
      version: "1.0.0"
    }
  });
}

export async function PATCH(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const body = settingsSchema.safeParse(await request.json());
  if (!body.success) {
    return jsonError("VALIDATION_ERROR", "Settings payload is invalid.", 400, body.error.flatten());
  }

  return jsonOk({ saved: true, settings: body.data });
}
