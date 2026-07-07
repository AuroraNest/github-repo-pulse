import { readRuntimeConfig } from "@repopulse/core";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookieValue, sessionCookieName } from "./lib/session";

const publicApiPathnames = new Set(["/api/health", "/api/auth/login", "/api/auth/logout", "/api/auth/me"]);
const publicPagePathnames = new Set(["/login"]);
const publicFilePattern = /\.[^/]+$/;

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = hasValidSession(request);

  if (pathname.startsWith("/api/")) {
    if (publicApiPathnames.has(pathname) || authenticated) {
      return NextResponse.next();
    }

    return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Login required." } }, { status: 401 });
  }

  if (publicFilePattern.test(pathname)) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/overview", request.url));
    }
    return NextResponse.next();
  }

  if (publicPagePathnames.has(pathname) || authenticated) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

function hasValidSession(request: NextRequest) {
  const session = request.cookies.get(sessionCookieName)?.value;
  if (!session) return false;

  const config = readRuntimeConfig();
  return session === getSessionCookieValue(config.sessionSecret);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"]
};
