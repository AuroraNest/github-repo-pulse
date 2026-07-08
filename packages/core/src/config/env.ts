export type RuntimeConfig = {
  appUrl: string;
  sessionSecret: string;
  adminEmail: string;
  adminPassword: string;
  databaseUrl?: string;
  githubToken?: string;
  githubApiBaseUrl: string;
  mockGitHub: boolean;
  syncConcurrency: number;
  aiEnabled: boolean;
};

export function readRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  return {
    appUrl: env.APP_URL || "http://localhost:3000",
    sessionSecret: env.SESSION_SECRET || "dev-session-secret",
    adminEmail: env.ADMIN_EMAIL || "admin@local.com",
    adminPassword: env.ADMIN_PASSWORD || "123456",
    databaseUrl: env.DATABASE_URL,
    githubToken: env.GITHUB_TOKEN,
    githubApiBaseUrl: env.GITHUB_API_BASE_URL || "https://api.github.com",
    mockGitHub: env.MOCK_GITHUB?.toLowerCase() === "true",
    syncConcurrency: Number(env.SYNC_CONCURRENCY || 3),
    aiEnabled: env.AI_ENABLED === "true"
  };
}
