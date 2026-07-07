import type { RepositorySummary } from "@repopulse/core";
import { readAppSettings, readTrackedRepositoryIds } from "@repopulse/db";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export type SetupState = {
  completed: boolean;
  dataRetentionDays: number | null;
  includePrivate: boolean;
  selectedRepositoryIds: string[];
  syncCron: string;
  syncTimezone: string;
};

let setupState: SetupState = defaultSetupState();

const setupStateCookieName = "repopulse_setup_state";

export async function getRuntimeSetupState() {
  try {
    const value = (await cookies()).get(setupStateCookieName)?.value;
    const parsed = value ? decodeSetupState(value) : null;
    if (parsed) return parsed;
  } catch {
    return setupState;
  }

  return setupState;
}

export async function getSetupState() {
  try {
    const [settings, selectedRepositoryIds] = await Promise.all([
      readAppSettings(),
      readTrackedRepositoryIds()
    ]);

    return {
      completed: settings.setupCompleted,
      dataRetentionDays: settings.dataRetentionDays,
      includePrivate: true,
      selectedRepositoryIds: Array.from(selectedRepositoryIds),
      syncCron: settings.syncCron,
      syncTimezone: settings.syncTimezone
    };
  } catch {
    return getRuntimeSetupState();
  }
}

export function saveRuntimeSetupState(next: SetupState) {
  setupState = normalizeSetupState(next);
  return setupState;
}

export function attachRuntimeSetupState(response: NextResponse, next: SetupState) {
  const normalized = saveRuntimeSetupState(next);
  response.cookies.set(setupStateCookieName, encodeSetupState(normalized), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}

export function applyRuntimeSetupState(repositories: RepositorySummary[], state: SetupState) {
  const selectedRepositoryIds = state.selectedRepositoryIds || [];
  if (selectedRepositoryIds.length === 0) {
    return repositories;
  }

  const tracked = new Set(selectedRepositoryIds);
  return repositories.map((repository) => ({
    ...repository,
    tracked: tracked.has(repository.id)
  }));
}

function defaultSetupState(): SetupState {
  return {
    completed: false,
    dataRetentionDays: 365,
    includePrivate: true,
    selectedRepositoryIds: [],
    syncCron: "0 8 * * *",
    syncTimezone: "UTC"
  };
}

function encodeSetupState(state: SetupState) {
  return Buffer.from(JSON.stringify(state)).toString("base64url");
}

function decodeSetupState(value: string): SetupState | null {
  try {
    return normalizeSetupState(JSON.parse(Buffer.from(value, "base64url").toString("utf8")));
  } catch {
    return null;
  }
}

function normalizeSetupState(value: unknown): SetupState {
  const source = typeof value === "object" && value ? value as Partial<SetupState> : {};
  return {
    completed: Boolean(source.completed),
    dataRetentionDays: source.dataRetentionDays === null ? null : typeof source.dataRetentionDays === "number" ? source.dataRetentionDays : 365,
    includePrivate: source.includePrivate !== false,
    selectedRepositoryIds: Array.isArray(source.selectedRepositoryIds) ? source.selectedRepositoryIds.map(String) : [],
    syncCron: typeof source.syncCron === "string" ? source.syncCron : "0 8 * * *",
    syncTimezone: typeof source.syncTimezone === "string" ? source.syncTimezone : "UTC"
  };
}
