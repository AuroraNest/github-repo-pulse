import { readRuntimeConfig } from "@repopulse/core";
import { NextRequest } from "next/server";
import { jsonOk } from "../../../../../lib/api";
import { requireSession } from "../../../../../lib/session";

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const config = readRuntimeConfig();
  return jsonOk({
    ok: true,
    mode: config.aiEnabled ? "configured" : "rule-based-fallback",
    message: config.aiEnabled ? "AI configuration is present." : "AI is disabled; reports use rule-based summaries."
  });
}
