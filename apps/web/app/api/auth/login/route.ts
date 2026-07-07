import { readRuntimeConfig } from "@repopulse/core";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "../../../../lib/api";
import { attachSession } from "../../../../lib/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const body = loginSchema.safeParse(await request.json());
  if (!body.success) {
    return jsonError("VALIDATION_ERROR", "Email and password are required.", 400, body.error.flatten());
  }

  const config = readRuntimeConfig();
  if (body.data.email !== config.adminEmail || body.data.password !== config.adminPassword) {
    return jsonError("INVALID_CREDENTIALS", "Email or password is incorrect.", 401);
  }

  return attachSession(NextResponse.json({ ok: true, data: { user: { email: config.adminEmail } } }));
}
