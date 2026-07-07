import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk } from "../../../../lib/api";
import { requireSession } from "../../../../lib/session";

const saveTokenSchema = z.object({
  token: z.string().min(8)
});

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const body = saveTokenSchema.safeParse(await request.json());
  if (!body.success) {
    return jsonError("VALIDATION_ERROR", "GitHub token is required.", 400, body.error.flatten());
  }

  return jsonOk({
    saved: true,
    tokenMask: `${body.data.token.slice(0, 10)}****${body.data.token.slice(-4)}`,
    note: "MVP route is session-ready; actual encrypted persistence belongs to the DB write layer."
  });
}
