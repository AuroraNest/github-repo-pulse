import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { readRuntimeConfig } from "@repopulse/core";

const runtimeGitHubTokenCookieName = "repopulse_github_token";
let runtimeGitHubToken = "";

export async function getRuntimeGitHubToken() {
  try {
    return runtimeGitHubToken || (await cookies()).get(runtimeGitHubTokenCookieName)?.value || "";
  } catch {
    return runtimeGitHubToken;
  }
}

export async function readGitHubRuntimeConfig() {
  const config = readRuntimeConfig();
  return { ...config, githubToken: config.githubToken || await getRuntimeGitHubToken() };
}

export function setRuntimeGitHubToken(token: string) {
  runtimeGitHubToken = token;
}

export function attachRuntimeGitHubToken(response: NextResponse, token: string) {
  response.cookies.set(runtimeGitHubTokenCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
