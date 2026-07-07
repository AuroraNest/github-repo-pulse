import { readRuntimeConfig } from "@repopulse/core";
import { NextRequest, NextResponse } from "next/server";

const cookieName = "repopulse_session";

export function getSessionUser(request: NextRequest) {
  const session = request.cookies.get(cookieName)?.value;
  if (!session) {
    return null;
  }

  const config = readRuntimeConfig();
  return session === sessionValue(config.sessionSecret) ? { email: config.adminEmail } : null;
}

export function requireSession(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Login required." } }, { status: 401 }) };
  }

  return { ok: true as const, user };
}

export function attachSession(response: NextResponse) {
  const config = readRuntimeConfig();
  response.cookies.set(cookieName, sessionValue(config.sessionSecret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}

export function clearSession(response: NextResponse) {
  response.cookies.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}

function sessionValue(secret: string) {
  return Buffer.from(`single-user:${secret}`).toString("base64url");
}
