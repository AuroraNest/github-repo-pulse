import { readRuntimeConfig } from "@repopulse/core";
import { jsonOk } from "../../../lib/api";

export async function GET() {
  const config = readRuntimeConfig();
  return jsonOk({
    status: "healthy",
    version: "1.0.0",
    database: config.databaseUrl ? "configured" : "mock",
    worker: "ready",
    lastSyncAt: "2026-07-07T08:05:00Z"
  });
}
