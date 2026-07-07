import { readRuntimeConfig } from "@repopulse/core";
import { NextRequest, NextResponse } from "next/server";

export const sessionCookieName = "repopulse_session";

export function getSessionUser(request: NextRequest) {
  const session = request.cookies.get(sessionCookieName)?.value;
  if (!session) {
    return null;
  }

  const config = readRuntimeConfig();
  return session === getSessionCookieValue(config.sessionSecret) ? { email: config.adminEmail } : null;
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
  response.cookies.set(sessionCookieName, getSessionCookieValue(config.sessionSecret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}

export function clearSession(response: NextResponse) {
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}

export function getSessionCookieValue(secret: string) {
  return base64UrlEncode(`single-user:${secret}`);
}

function base64UrlEncode(value: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value).toString("base64url");
  }

  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
