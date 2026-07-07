import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { createPool } from "./client";

const settingsId = "default";
const connectionId = "default";

export type AppSettings = {
  setupCompleted: boolean;
  syncEnabled: boolean;
  syncCron: string;
  syncTimezone: string;
  dataRetentionDays: number | null;
  aiEnabled: boolean;
};

export type GitHubConnectionRecord = {
  accountLogin: string;
  accountId: string;
  accountAvatarUrl: string | null;
  tokenMask: string;
  encryptedToken: string;
  iv: string;
  authTag: string;
  permissions: unknown;
  lastVerifiedAt: string | null;
  status: string;
};

export type RepositoryRecordInput = {
  id: string;
  githubRepoId: number;
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string;
  visibility: string;
  isPrivate: boolean;
  primaryLanguage: string;
  tracked: boolean;
  favorite: boolean;
  updatedAt: string;
};

type AppSettingsRow = RowDataPacket & {
  setup_completed: number | boolean;
  sync_enabled: number | boolean;
  sync_cron: string;
  sync_timezone: string;
  data_retention_days: number | null;
  ai_enabled: number | boolean;
};

type GitHubConnectionRow = RowDataPacket & {
  account_login: string;
  account_id: string;
  account_avatar_url: string | null;
  token_mask: string;
  encrypted_token: string;
  iv: string;
  auth_tag: string;
  permissions_json: unknown;
  last_verified_at: Date | string | null;
  status: string;
};

type TrackedRepositoryRow = RowDataPacket & {
  id: string;
};

type ReportRow = RowDataPacket & {
  id: string;
  report_type: "daily" | "weekly" | "monthly";
  title: string;
  summary: string;
  data_json: unknown;
  markdown_content: string;
  ai_generated: number | boolean;
  created_at: Date | string;
};

type SyncRunRow = RowDataPacket & {
  id: string;
  trigger_source: "schedule" | "manual" | "setup" | "api";
  status: "running" | "success" | "partial_failed" | "failed" | "cancelled";
  started_at: Date | string;
  finished_at: Date | string | null;
  total_repositories: number;
  success_count: number;
  failed_count: number;
  error_message: string | null;
};

type SyncRunItemRow = RowDataPacket & {
  id: string;
  sync_run_id: string;
  repository_id: string;
  status: "success" | "partial_failed" | "failed";
  started_at: Date | string | null;
  finished_at: Date | string | null;
  collected_repo: number | boolean;
  collected_traffic: number | boolean;
  collected_releases: number | boolean;
  error_code: string | null;
  error_message: string | null;
};

export type PersistedReport = {
  id: string;
  type: "daily" | "weekly" | "monthly";
  title: string;
  generatedAt: string;
  summary: string;
  data: unknown;
  markdown: string;
  aiGenerated: boolean;
};

export type PersistedSyncRunItem = {
  id: string;
  syncRunId: string;
  repositoryId: string;
  status: "success" | "partial_failed" | "failed";
  startedAt: string | null;
  finishedAt: string | null;
  collectedRepo: boolean;
  collectedTraffic: boolean;
  collectedReleases: boolean;
  errorCode: string | null;
  errorMessage: string | null;
};

export type PersistedSyncRun = {
  id: string;
  trigger: "schedule" | "manual" | "setup" | "api";
  status: "running" | "success" | "partial_failed" | "failed" | "cancelled";
  startedAt: string;
  finishedAt: string | null;
  totalRepositories: number;
  successCount: number;
  failedCount: number;
  errorMessage: string | null;
};

export function defaultAppSettings(): AppSettings {
  return {
    setupCompleted: false,
    syncEnabled: true,
    syncCron: "0 8 * * *",
    syncTimezone: "UTC",
    dataRetentionDays: 365,
    aiEnabled: false
  };
}

export async function readAppSettings(): Promise<AppSettings> {
  const pool = await createPool();
  try {
    const [rows] = await pool.query<AppSettingsRow[]>(
      "SELECT setup_completed, sync_enabled, sync_cron, sync_timezone, data_retention_days, ai_enabled FROM app_settings WHERE id = ? LIMIT 1",
      [settingsId]
    );
    const row = rows[0];
    if (!row) return defaultAppSettings();

    return {
      setupCompleted: Boolean(row.setup_completed),
      syncEnabled: Boolean(row.sync_enabled),
      syncCron: row.sync_cron,
      syncTimezone: row.sync_timezone,
      dataRetentionDays: row.data_retention_days,
      aiEnabled: Boolean(row.ai_enabled)
    };
  } finally {
    await pool.end();
  }
}

export async function saveAppSettings(next: Partial<AppSettings>): Promise<AppSettings> {
  const definedNext = Object.fromEntries(
    Object.entries(next).filter((entry): entry is [keyof AppSettings, AppSettings[keyof AppSettings]] => entry[1] !== undefined)
  ) as Partial<AppSettings>;
  const current = { ...defaultAppSettings(), ...await readAppSettings(), ...definedNext };
  const pool = await createPool();
  try {
    await pool.execute<ResultSetHeader>(
      `INSERT INTO app_settings (id, setup_completed, sync_enabled, sync_cron, sync_timezone, data_retention_days, ai_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         setup_completed = VALUES(setup_completed),
         sync_enabled = VALUES(sync_enabled),
         sync_cron = VALUES(sync_cron),
         sync_timezone = VALUES(sync_timezone),
         data_retention_days = VALUES(data_retention_days),
         ai_enabled = VALUES(ai_enabled)`,
      [
        settingsId,
        current.setupCompleted,
        current.syncEnabled,
        current.syncCron,
        current.syncTimezone,
        current.dataRetentionDays,
        current.aiEnabled
      ]
    );
    return current;
  } finally {
    await pool.end();
  }
}

export async function readGitHubConnection(): Promise<GitHubConnectionRecord | null> {
  const pool = await createPool();
  try {
    const [rows] = await pool.query<GitHubConnectionRow[]>(
      `SELECT account_login, account_id, account_avatar_url, token_mask, encrypted_token, iv, auth_tag,
              permissions_json, last_verified_at, status
       FROM github_connections
       WHERE id = ? AND status = 'active'
       LIMIT 1`,
      [connectionId]
    );
    const row = rows[0];
    if (!row) return null;

    return {
      accountLogin: row.account_login,
      accountId: row.account_id,
      accountAvatarUrl: row.account_avatar_url,
      tokenMask: row.token_mask,
      encryptedToken: row.encrypted_token,
      iv: row.iv,
      authTag: row.auth_tag,
      permissions: row.permissions_json,
      lastVerifiedAt: row.last_verified_at ? String(row.last_verified_at) : null,
      status: row.status
    };
  } finally {
    await pool.end();
  }
}

export async function saveGitHubConnection(input: {
  accountLogin: string;
  accountId: string | number;
  accountAvatarUrl: string | null;
  tokenMask: string;
  encryptedToken: string;
  iv: string;
  authTag: string;
  permissions: unknown;
}) {
  const pool = await createPool();
  try {
    await pool.execute<ResultSetHeader>(
      `INSERT INTO github_connections
         (id, provider, account_login, account_id, account_avatar_url, token_mask, encrypted_token, iv, auth_tag, permissions_json, last_verified_at, status)
       VALUES (?, 'github', ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'active')
       ON DUPLICATE KEY UPDATE
         account_login = VALUES(account_login),
         account_id = VALUES(account_id),
         account_avatar_url = VALUES(account_avatar_url),
         token_mask = VALUES(token_mask),
         encrypted_token = VALUES(encrypted_token),
         iv = VALUES(iv),
         auth_tag = VALUES(auth_tag),
         permissions_json = VALUES(permissions_json),
         last_verified_at = VALUES(last_verified_at),
         status = 'active'`,
      [
        connectionId,
        input.accountLogin,
        String(input.accountId),
        input.accountAvatarUrl,
        input.tokenMask,
        input.encryptedToken,
        input.iv,
        input.authTag,
        JSON.stringify(input.permissions)
      ]
    );
  } finally {
    await pool.end();
  }
}

export async function readTrackedRepositoryIds(): Promise<Set<string>> {
  const pool = await createPool();
  try {
    const [rows] = await pool.query<TrackedRepositoryRow[]>("SELECT id FROM repositories WHERE tracked = TRUE");
    return new Set(rows.map((row) => row.id));
  } finally {
    await pool.end();
  }
}

export async function saveRepositories(input: {
  repositories: RepositoryRecordInput[];
  selectedRepositoryIds: string[];
  trackAll?: boolean;
}) {
  const selected = new Set(input.selectedRepositoryIds.map(String));
  const pool = await createPool();
  try {
    await pool.execute<ResultSetHeader>("UPDATE repositories SET tracked = FALSE, tracking_enabled_at = NULL");

    for (const repository of input.repositories) {
      const tracked = Boolean(input.trackAll || selected.has(repository.id) || selected.has(String(repository.githubRepoId)));
      await pool.execute<ResultSetHeader>(
        `INSERT INTO repositories
           (id, github_repo_id, owner, name, full_name, html_url, description, visibility, is_private,
            primary_language, tracked, favorite, tracking_enabled_at, github_updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, IF(?, NOW(), NULL), ?)
         ON DUPLICATE KEY UPDATE
           owner = VALUES(owner),
           name = VALUES(name),
           full_name = VALUES(full_name),
           html_url = VALUES(html_url),
           description = VALUES(description),
           visibility = VALUES(visibility),
           is_private = VALUES(is_private),
           primary_language = VALUES(primary_language),
           tracked = VALUES(tracked),
           tracking_enabled_at = IF(VALUES(tracked), COALESCE(tracking_enabled_at, NOW()), NULL),
           github_updated_at = VALUES(github_updated_at)`,
        [
          repository.id,
          repository.githubRepoId,
          repository.owner,
          repository.name,
          repository.fullName,
          repository.htmlUrl,
          repository.description,
          repository.visibility,
          repository.isPrivate,
          repository.primaryLanguage,
          tracked,
          repository.favorite,
          tracked,
          toMysqlDateTime(repository.updatedAt)
        ]
      );
    }
  } finally {
    await pool.end();
  }
}

export async function readReports(limit = 20): Promise<PersistedReport[]> {
  const pool = await createPool();
  try {
    const [rows] = await pool.query<ReportRow[]>(
      `SELECT id, report_type, title, summary, data_json, markdown_content, ai_generated, created_at
       FROM reports
       ORDER BY created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows.map((row) => ({
      id: row.id,
      type: row.report_type,
      title: row.title,
      generatedAt: toIsoString(row.created_at),
      summary: row.summary,
      data: row.data_json,
      markdown: row.markdown_content,
      aiGenerated: Boolean(row.ai_generated)
    }));
  } finally {
    await pool.end();
  }
}

export async function saveReport(input: {
  id: string;
  type: "daily" | "weekly" | "monthly";
  title: string;
  generatedAt: string;
  summary: string;
  data: unknown;
  markdown: string;
  aiGenerated: boolean;
}) {
  const pool = await createPool();
  try {
    await pool.execute<ResultSetHeader>(
      `INSERT INTO reports (id, report_type, period_start, period_end, title, summary, data_json, markdown_content, ai_generated, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         summary = VALUES(summary),
         data_json = VALUES(data_json),
         markdown_content = VALUES(markdown_content),
         ai_generated = VALUES(ai_generated),
         created_at = VALUES(created_at)`,
      [
        input.id,
        input.type,
        input.generatedAt.slice(0, 10),
        input.generatedAt.slice(0, 10),
        input.title,
        input.summary,
        JSON.stringify(input.data),
        input.markdown,
        input.aiGenerated,
        toMysqlDateTime(input.generatedAt)
      ]
    );
  } finally {
    await pool.end();
  }
}

export async function readSyncRuns(limit = 20): Promise<PersistedSyncRun[]> {
  const pool = await createPool();
  try {
    const [rows] = await pool.query<SyncRunRow[]>(
      `SELECT id, trigger_source, status, started_at, finished_at, total_repositories, success_count, failed_count, error_message
       FROM sync_runs
       ORDER BY started_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows.map(toPersistedSyncRun);
  } finally {
    await pool.end();
  }
}

export async function readSyncRunWithItems(id: string): Promise<{ run: PersistedSyncRun; items: PersistedSyncRunItem[] } | null> {
  const pool = await createPool();
  try {
    const [runRows] = await pool.query<SyncRunRow[]>(
      `SELECT id, trigger_source, status, started_at, finished_at, total_repositories, success_count, failed_count, error_message
       FROM sync_runs
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    const runRow = runRows[0];
    if (!runRow) return null;

    const [itemRows] = await pool.query<SyncRunItemRow[]>(
      `SELECT id, sync_run_id, repository_id, status, started_at, finished_at, collected_repo, collected_traffic, collected_releases, error_code, error_message
       FROM sync_run_items
       WHERE sync_run_id = ?
       ORDER BY created_at ASC`,
      [id]
    );

    return { run: toPersistedSyncRun(runRow), items: itemRows.map(toPersistedSyncRunItem) };
  } finally {
    await pool.end();
  }
}

export async function saveSyncRun(input: {
  id: string;
  trigger: "schedule" | "manual" | "setup" | "api";
  status: "success" | "partial_failed" | "failed";
  startedAt: string;
  finishedAt: string;
  totalRepositories: number;
  successCount: number;
  failedCount: number;
  errorMessage?: string;
  items: Array<{
    id: string;
    repositoryId: string;
    status: "success" | "partial_failed" | "failed";
    startedAt: string;
    finishedAt: string;
    collectedRepo: boolean;
    collectedTraffic: boolean;
    collectedReleases: boolean;
    errorCode?: string;
    errorMessage?: string;
  }>;
}) {
  const pool = await createPool();
  try {
    await pool.execute<ResultSetHeader>(
      `INSERT INTO sync_runs
         (id, trigger_source, status, started_at, finished_at, duration_ms, total_repositories, success_count, failed_count, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         status = VALUES(status),
         finished_at = VALUES(finished_at),
         duration_ms = VALUES(duration_ms),
         total_repositories = VALUES(total_repositories),
         success_count = VALUES(success_count),
         failed_count = VALUES(failed_count),
         error_message = VALUES(error_message)`,
      [
        input.id,
        input.trigger,
        input.status,
        toMysqlDateTime(input.startedAt),
        toMysqlDateTime(input.finishedAt),
        Math.max(0, new Date(input.finishedAt).getTime() - new Date(input.startedAt).getTime()),
        input.totalRepositories,
        input.successCount,
        input.failedCount,
        input.errorMessage || null
      ]
    );

    for (const item of input.items) {
      await pool.execute<ResultSetHeader>(
        `INSERT INTO sync_run_items
           (id, sync_run_id, repository_id, status, started_at, finished_at, duration_ms,
            collected_repo, collected_traffic, collected_releases, error_code, error_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           status = VALUES(status),
           finished_at = VALUES(finished_at),
           duration_ms = VALUES(duration_ms),
           collected_repo = VALUES(collected_repo),
           collected_traffic = VALUES(collected_traffic),
           collected_releases = VALUES(collected_releases),
           error_code = VALUES(error_code),
           error_message = VALUES(error_message)`,
        [
          item.id,
          input.id,
          item.repositoryId,
          item.status,
          toMysqlDateTime(item.startedAt),
          toMysqlDateTime(item.finishedAt),
          Math.max(0, new Date(item.finishedAt).getTime() - new Date(item.startedAt).getTime()),
          item.collectedRepo,
          item.collectedTraffic,
          item.collectedReleases,
          item.errorCode || null,
          item.errorMessage || null
        ]
      );
    }
  } finally {
    await pool.end();
  }
}

function toMysqlDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function toIsoString(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function toNullableIsoString(value: Date | string | null) {
  return value === null ? null : toIsoString(value);
}

function toPersistedSyncRun(row: SyncRunRow): PersistedSyncRun {
  return {
    id: row.id,
    trigger: row.trigger_source,
    status: row.status,
    startedAt: toIsoString(row.started_at),
    finishedAt: toNullableIsoString(row.finished_at),
    totalRepositories: row.total_repositories,
    successCount: row.success_count,
    failedCount: row.failed_count,
    errorMessage: row.error_message
  };
}

function toPersistedSyncRunItem(row: SyncRunItemRow): PersistedSyncRunItem {
  return {
    id: row.id,
    syncRunId: row.sync_run_id,
    repositoryId: row.repository_id,
    status: row.status,
    startedAt: toNullableIsoString(row.started_at),
    finishedAt: toNullableIsoString(row.finished_at),
    collectedRepo: Boolean(row.collected_repo),
    collectedTraffic: Boolean(row.collected_traffic),
    collectedReleases: Boolean(row.collected_releases),
    errorCode: row.error_code,
    errorMessage: row.error_message
  };
}
