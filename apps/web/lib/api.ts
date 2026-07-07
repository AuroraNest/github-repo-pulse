import { fail, ok, type ApiResponse } from "@repopulse/core";
import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(ok(data), init);
}

export function jsonError(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json(fail(code, message, details), { status });
}

export function parseSearchParams(request: Request) {
  return new URL(request.url).searchParams;
}

export type RouteResult<T> = Promise<NextResponse<ApiResponse<T>>>;
