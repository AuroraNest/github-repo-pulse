import { saveAppSettings, saveRepositories } from "@repopulse/db";
import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk } from "../../../../lib/api";
import { getRepositoryCollection } from "../../../../lib/data-source";
import { attachRuntimeSetupState } from "../../../../lib/runtime-setup-state";
import { requireSession } from "../../../../lib/session";

const completeSchema = z.object({
  selectedRepositoryIds: z.array(z.union([z.string(), z.number()])).min(1),
  trackAll: z.boolean().default(false),
  includePrivate: z.boolean().default(true),
  syncCron: z.string().default("0 8 * * *"),
  syncTimezone: z.string().default("UTC"),
  dataRetentionDays: z.number().int().positive().nullable().optional()
});

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const body = completeSchema.safeParse(await request.json());
  if (!body.success) {
    return jsonError("VALIDATION_ERROR", "Setup payload is invalid.", 400, body.error.flatten());
  }

  const setup = {
    completed: true,
    dataRetentionDays: body.data.dataRetentionDays ?? null,
    includePrivate: body.data.includePrivate,
    selectedRepositoryIds: body.data.selectedRepositoryIds.map(String),
    syncCron: body.data.syncCron,
    syncTimezone: body.data.syncTimezone
  };

  const { repositories } = await getRepositoryCollection();
  try {
    await saveAppSettings({
      setupCompleted: setup.completed,
      syncCron: setup.syncCron,
      syncTimezone: setup.syncTimezone,
      dataRetentionDays: setup.dataRetentionDays
    });
    await saveRepositories({
      repositories,
      selectedRepositoryIds: setup.selectedRepositoryIds,
      trackAll: body.data.trackAll
    });
  } catch {
    return jsonError("DATABASE_PERSISTENCE_FAILED", "Setup could not be saved.", 500);
  }

  return attachRuntimeSetupState(jsonOk({
    setupCompleted: setup.completed,
    trackedRepositoriesCount: body.data.trackAll ? repositories.length : setup.selectedRepositoryIds.length,
    firstSync: { status: "queued", trigger: "setup" }
  }), setup);
}
