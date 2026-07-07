import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk } from "../../../../lib/api";
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

  return attachRuntimeSetupState(jsonOk({
    setupCompleted: setup.completed,
    trackedRepositoriesCount: setup.selectedRepositoryIds.length,
    firstSync: { status: "queued", trigger: "setup" }
  }), setup);
}
