import type { RepositorySummary } from "@repopulse/core";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

type SetupState = {
  completed: boolean;
  dataRetentionDays: number | null;
  includePrivate: boolean;
  selectedRepositoryIds: string[];
  syncCron: string;
  syncTimezone: string;
};

let setupState: SetupState = {
  completed: false,
  dataRetentionDays: 365,
  includePrivate: true,
  selectedRepositoryIds: [],
  syncCron: "0 8 * * *",
  syncTimezone: "UTC"
};

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

export function saveRuntimeSetupState(next: SetupState) {
  setupState = next;
  return setupState;
}

export function attachRuntimeSetupState(response: NextResponse, next: SetupState) {
  saveRuntimeSetupState(next);
  response.cookies.set(setupStateCookieName, encodeSetupState(next), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}

export function applyRuntimeSetupState(repositories: RepositorySummary[], state: SetupState) {
  if (state.selectedRepositoryIds.length === 0) {
    return repositories;
  }

  const tracked = new Set(state.selectedRepositoryIds);
  return repositories.map((repository) => ({
    ...repository,
    tracked: tracked.has(repository.id)
  }));
}

function encodeSetupState(state: SetupState) {
  return Buffer.from(JSON.stringify(state)).toString("base64url");
}

function decodeSetupState(value: string): SetupState | null {
  try {
    const decoded = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SetupState;
    return Array.isArray(decoded.selectedRepositoryIds) ? decoded : null;
  } catch {
    return null;
  }
}
