import { readRuntimeConfig } from "@repopulse/core";
import { defaultAppSettings, readAppSettings, saveAppSettings } from "@repopulse/db";
import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk } from "../../../lib/api";
import { getGitHubDataSource, githubDataSourcePayload } from "../../../lib/data-source";
import { readStoredGitHubConnection } from "../../../lib/github-connection";
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
  const settings = await readAppSettings().catch(() => defaultAppSettings());
  const connection = await readStoredGitHubConnection();
  const githubSource = await getGitHubDataSource();
  return jsonOk({
    sync: {
      enabled: settings.syncEnabled,
      cron: settings.syncCron,
      timezone: settings.syncTimezone,
      concurrency: config.syncConcurrency
    },
    retention: { dataRetentionDays: settings.dataRetentionDays },
    github: {
      ...githubDataSourcePayload(githubSource),
      connected: Boolean(connection) || githubSource.configured,
      accountLogin: connection?.accountLogin || null,
      tokenMask: connection?.tokenMask || (githubSource.mode === "live" ? "configured" : null),
      rateLimit: null
    },
    ai: {
      enabled: settings.aiEnabled || config.aiEnabled,
      provider: "OpenAI-compatible",
      model: process.env.AI_MODEL || null
    },
    database: {
      provider: "mysql",
      configured: Boolean(config.databaseUrl),
      status: config.databaseUrl ? "configured" : "placeholder"
    },
    worker: {
      heartbeat: githubSource.mode === "configuration_required" ? "configuration-required" : "ready",
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

  try {
    const settings = await saveAppSettings({
      syncEnabled: body.data.syncEnabled,
      syncCron: body.data.syncCron,
      syncTimezone: body.data.syncTimezone,
      aiEnabled: body.data.aiEnabled
    });
    return jsonOk({ saved: true, settings });
  } catch {
    return jsonError("DATABASE_PERSISTENCE_FAILED", "Settings could not be saved.", 500);
  }
}
