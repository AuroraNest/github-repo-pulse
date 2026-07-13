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

export type LatestRepositorySnapshot = {
  snapshotDate: string;
  totalDownloads: number;
  latestRelease: string | null;
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

type PreviousAssetSnapshotRow = RowDataPacket & {
  download_count: number;
};

type ReleaseAssetDeltaRow = RowDataPacket & {
  asset_id: string;
  snapshot_date: Date | string;
  download_count: number;
  daily_delta: number;
};

type RepositorySnapshotTrendRow = RowDataPacket & {
  snapshot_date: Date | string;
  stars_count: number;
  forks_count: number;
  total_release_downloads: number;
};

type LatestRepositorySnapshotRow = RowDataPacket & {
  repository_id: string;
  snapshot_date: Date | string;
  total_release_downloads: number;
  latest_release_tag: string | null;
};

type TrafficDailyTrendRow = RowDataPacket & {
  traffic_date: Date | string;
  metric: "views" | "clones";
  count: number;
  uniques: number;
};

type RepositoryTrafficTotalRow = RowDataPacket & {
  repository_id: string;
  metric: "views" | "clones";
  total_count: number | string | null;
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

export type SnapshotTrafficDailyPoint = {
  date: string;
  metric: "views" | "clones";
  count: number;
  uniques: number;
};

export type SnapshotTrafficData = {
  daily?: SnapshotTrafficDailyPoint[];
  popularPaths?: Array<{ path: string; title: string; count: number; uniques: number }>;
  referrers?: Array<{ referrer: string; count: number; uniques: number }>;
};

export type SnapshotReleaseAsset = {
  id: string;
  githubAssetId?: number;
  releaseId?: string;
  githubReleaseId?: number;
  repositoryId: string;
  tagName: string;
  releaseName?: string | null;
  releaseHtmlUrl?: string | null;
  releaseCreatedAt?: string;
  releaseUpdatedAt?: string;
  assetName: string;
  assetLabel?: string | null;
  assetSizeBytes?: number;
  assetContentType?: string | null;
  assetState?: string | null;
  assetCreatedAt?: string;
  assetUpdatedAt?: string;
  publishedAt: string;
  totalDownloads: number;
  browserDownloadUrl: string;
};

export type RepositoryMetricSnapshotInput = {
  snapshotDate?: string;
  repositories: Array<{
    repository: {
      id: string;
      stars: number;
      forks: number;
      latestRelease: string;
      totalDownloads: number;
    };
    traffic?: SnapshotTrafficData;
    assets?: SnapshotReleaseAsset[];
  }>;
};

export type ReleaseAssetDelta = {
  assetId: string;
  latestDownloadCount: number;
  todayDownloads: number;
  sevenDayDownloads: number;
  thirtyDayDownloads: number;
};

export type SnapshotTrendPoint = {
  date: string;
  stars: number;
  forks: number;
  downloads: number;
  views: number;
  clones: number;
};

export type RepositoryTrafficTotals = {
  totalViews: number;
  totalClones: number;
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

export async function readReleaseAssetDeltas(assetIds: string[]): Promise<Map<string, ReleaseAssetDelta>> {
  if (assetIds.length === 0) return new Map();

  const pool = await createPool();
  const placeholders = assetIds.map(() => "?").join(", ");
  try {
    const [rows] = await pool.query<ReleaseAssetDeltaRow[]>(
      `SELECT asset_id, snapshot_date, download_count, daily_delta
       FROM release_asset_snapshots
       WHERE asset_id IN (${placeholders})
         AND snapshot_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       ORDER BY asset_id, snapshot_date ASC`,
      assetIds
    );

    const deltas = new Map<string, ReleaseAssetDelta>();
    const sevenDayCutoff = dateDaysAgo(6);
    for (const row of rows) {
      const snapshotDate = rowDateToDateOnly(row.snapshot_date);
      const current = deltas.get(row.asset_id) || {
        assetId: row.asset_id,
        latestDownloadCount: row.download_count,
        todayDownloads: 0,
        sevenDayDownloads: 0,
        thirtyDayDownloads: 0
      };
      current.latestDownloadCount = row.download_count;
      current.todayDownloads = row.daily_delta;
      if (snapshotDate >= sevenDayCutoff) {
        current.sevenDayDownloads += row.daily_delta;
      }
      current.thirtyDayDownloads += row.daily_delta;
      deltas.set(row.asset_id, current);
    }
    return deltas;
  } finally {
    await pool.end();
  }
}

export async function readRepositorySnapshotTrends(repositoryIds: string[], days = 30): Promise<SnapshotTrendPoint[]> {
  if (repositoryIds.length === 0) return [];

  const pool = await createPool();
  const placeholders = repositoryIds.map(() => "?").join(", ");
  try {
    const [rows] = await pool.query<RepositorySnapshotTrendRow[]>(
      `SELECT snapshot_date,
              SUM(stars_count) AS stars_count,
              SUM(forks_count) AS forks_count,
              SUM(total_release_downloads) AS total_release_downloads
       FROM repository_snapshots
       WHERE repository_id IN (${placeholders})
         AND snapshot_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY snapshot_date
       ORDER BY snapshot_date ASC`,
      [...repositoryIds, days]
    );

    return rows.map((row) => ({
      date: rowDateToDateOnly(row.snapshot_date),
      stars: Number(row.stars_count) || 0,
      forks: Number(row.forks_count) || 0,
      downloads: Number(row.total_release_downloads) || 0,
      views: 0,
      clones: 0
    }));
  } finally {
    await pool.end();
  }
}

export async function readLatestRepositorySnapshots(repositoryIds: string[]): Promise<Map<string, LatestRepositorySnapshot>> {
  if (repositoryIds.length === 0) return new Map();

  const pool = await createPool();
  const placeholders = repositoryIds.map(() => "?").join(", ");
  try {
    const [rows] = await pool.query<LatestRepositorySnapshotRow[]>(
      `SELECT snapshot.repository_id, snapshot.snapshot_date, snapshot.total_release_downloads, snapshot.latest_release_tag
       FROM repository_snapshots snapshot
       INNER JOIN (
         SELECT repository_id, MAX(snapshot_date) AS snapshot_date
         FROM repository_snapshots
         WHERE repository_id IN (${placeholders})
         GROUP BY repository_id
       ) latest ON latest.repository_id = snapshot.repository_id AND latest.snapshot_date = snapshot.snapshot_date`,
      repositoryIds
    );

    return new Map(rows.map((row) => [row.repository_id, {
      snapshotDate: rowDateToDateOnly(row.snapshot_date),
      totalDownloads: Number(row.total_release_downloads) || 0,
      latestRelease: row.latest_release_tag
    }]));
  } finally {
    await pool.end();
  }
}

export async function readTrafficDailyTrends(repositoryIds: string[], days = 30): Promise<SnapshotTrendPoint[]> {
  if (repositoryIds.length === 0) return [];

  const pool = await createPool();
  const placeholders = repositoryIds.map(() => "?").join(", ");
  try {
    const [rows] = await pool.query<TrafficDailyTrendRow[]>(
      `SELECT traffic_date, metric, SUM(count) AS count, SUM(uniques) AS uniques
       FROM traffic_daily
       WHERE repository_id IN (${placeholders})
         AND traffic_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY traffic_date, metric
       ORDER BY traffic_date ASC`,
      [...repositoryIds, days]
    );

    const byDate = new Map<string, SnapshotTrendPoint>();
    for (const row of rows) {
      const date = rowDateToDateOnly(row.traffic_date);
      const current = byDate.get(date) || { date, stars: 0, forks: 0, downloads: 0, views: 0, clones: 0 };
      if (row.metric === "views") {
        current.views = Number(row.count) || 0;
      } else {
        current.clones = Number(row.count) || 0;
      }
      byDate.set(date, current);
    }

    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  } finally {
    await pool.end();
  }
}

export async function readRepositoryTrafficTotals(repositoryIds: string[]): Promise<Map<string, RepositoryTrafficTotals>> {
  if (repositoryIds.length === 0) return new Map();

  const pool = await createPool();
  const placeholders = repositoryIds.map(() => "?").join(", ");
  try {
    const [rows] = await pool.query<RepositoryTrafficTotalRow[]>(
      `SELECT repository_id, metric, SUM(count) AS total_count
       FROM traffic_daily
       WHERE repository_id IN (${placeholders})
       GROUP BY repository_id, metric`,
      repositoryIds
    );

    const totals = new Map<string, RepositoryTrafficTotals>();
    for (const row of rows) {
      const current = totals.get(row.repository_id) || { totalViews: 0, totalClones: 0 };
      const total = Number(row.total_count) || 0;
      if (row.metric === "views") {
        current.totalViews = total;
      } else {
        current.totalClones = total;
      }
      totals.set(row.repository_id, current);
    }

    return totals;
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

export async function saveRepositoryMetricSnapshots(input: RepositoryMetricSnapshotInput) {
  const snapshotDate = toDateOnly(input.snapshotDate || new Date().toISOString());
  const pool = await createPool();
  try {
    for (const item of input.repositories) {
      const assets = item.assets || [];
      const latestAsset = assets
        .slice()
        .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))[0];
      const releaseTags = new Set(assets.map((asset) => asset.tagName).filter(Boolean));
      const totalDownloads = assets.reduce((sum, asset) => sum + asset.totalDownloads, 0) || item.repository.totalDownloads;

      await pool.execute<ResultSetHeader>(
        `INSERT INTO repository_snapshots
           (id, repository_id, snapshot_date, stars_count, forks_count, watchers_count, open_issues_count,
            release_count, latest_release_tag, latest_release_at, total_release_downloads)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           stars_count = VALUES(stars_count),
           forks_count = VALUES(forks_count),
           watchers_count = VALUES(watchers_count),
           release_count = VALUES(release_count),
           latest_release_tag = VALUES(latest_release_tag),
           latest_release_at = VALUES(latest_release_at),
           total_release_downloads = VALUES(total_release_downloads)`,
        [
          `repo-snap-${item.repository.id}-${snapshotDate}`,
          item.repository.id,
          snapshotDate,
          item.repository.stars,
          item.repository.forks,
          item.repository.stars,
          releaseTags.size,
          latestAsset?.tagName || normalizeLatestRelease(item.repository.latestRelease),
          latestAsset?.publishedAt ? toMysqlDateTime(latestAsset.publishedAt) : null,
          totalDownloads
        ]
      );

      await saveTrafficSnapshotRows(pool, item.repository.id, snapshotDate, item.traffic);
      await saveReleaseSnapshotRows(pool, item.repository.id, snapshotDate, assets);
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

function toDateOnly(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function rowDateToDateOnly(value: Date | string) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return String(value).slice(0, 10);
}

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return rowDateToDateOnly(date);
}

function normalizeLatestRelease(value: string) {
  return value && value !== "Not synced" ? value : null;
}

async function saveTrafficSnapshotRows(
  pool: Awaited<ReturnType<typeof createPool>>,
  repositoryId: string,
  snapshotDate: string,
  traffic?: SnapshotTrafficData
) {
  const daily = traffic?.daily || [];
  const popularPaths = traffic?.popularPaths || [];
  const referrers = traffic?.referrers || [];
  if (daily.length === 0 && popularPaths.length === 0 && referrers.length === 0) return;

  let viewsCount = 0;
  let viewsUniques = 0;
  let clonesCount = 0;
  let clonesUniques = 0;

  for (const point of daily) {
    if (point.metric === "views") {
      viewsCount += point.count;
      viewsUniques += point.uniques;
    } else {
      clonesCount += point.count;
      clonesUniques += point.uniques;
    }

    await pool.execute<ResultSetHeader>(
      `INSERT INTO traffic_daily
         (id, repository_id, metric, traffic_date, count, uniques, last_seen_snapshot_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         count = VALUES(count),
         uniques = VALUES(uniques),
         last_seen_snapshot_date = VALUES(last_seen_snapshot_date)`,
      [
        `traffic-${repositoryId}-${point.metric}-${point.date}`,
        repositoryId,
        point.metric,
        point.date,
        point.count,
        point.uniques,
        snapshotDate
      ]
    );
  }

  await pool.execute<ResultSetHeader>(
    `INSERT INTO traffic_summary_snapshots
       (id, repository_id, snapshot_date, views_count_14d, views_uniques_14d, clones_count_14d, clones_uniques_14d)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       views_count_14d = VALUES(views_count_14d),
       views_uniques_14d = VALUES(views_uniques_14d),
       clones_count_14d = VALUES(clones_count_14d),
       clones_uniques_14d = VALUES(clones_uniques_14d)`,
    [
      `traffic-sum-${repositoryId}-${snapshotDate}`,
      repositoryId,
      snapshotDate,
      viewsCount,
      viewsUniques,
      clonesCount,
      clonesUniques
    ]
  );

  for (const [index, path] of popularPaths.entries()) {
    await pool.execute<ResultSetHeader>(
      `INSERT INTO popular_path_snapshots
         (id, repository_id, snapshot_date, path, title, count, uniques)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         count = VALUES(count),
         uniques = VALUES(uniques)`,
      [
        `path-${repositoryId}-${snapshotDate}-${index}`,
        repositoryId,
        snapshotDate,
        path.path,
        path.title,
        path.count,
        path.uniques
      ]
    );
  }

  for (const [index, referrer] of referrers.entries()) {
    await pool.execute<ResultSetHeader>(
      `INSERT INTO referrer_snapshots
         (id, repository_id, snapshot_date, referrer, count, uniques)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         count = VALUES(count),
         uniques = VALUES(uniques)`,
      [
        `ref-${repositoryId}-${snapshotDate}-${index}`,
        repositoryId,
        snapshotDate,
        referrer.referrer,
        referrer.count,
        referrer.uniques
      ]
    );
  }
}

async function saveReleaseSnapshotRows(
  pool: Awaited<ReturnType<typeof createPool>>,
  repositoryId: string,
  snapshotDate: string,
  assets: SnapshotReleaseAsset[]
) {
  for (const asset of assets) {
    if (!asset.githubReleaseId || !asset.githubAssetId) continue;

    const releaseId = asset.releaseId || `github-release-${asset.githubReleaseId}`;
    await pool.execute<ResultSetHeader>(
      `INSERT INTO releases
         (id, github_release_id, repository_id, tag_name, name, html_url, draft, prerelease,
          published_at, github_created_at, github_updated_at)
       VALUES (?, ?, ?, ?, ?, ?, FALSE, FALSE, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         tag_name = VALUES(tag_name),
         name = VALUES(name),
         html_url = VALUES(html_url),
         published_at = VALUES(published_at),
         github_created_at = VALUES(github_created_at),
         github_updated_at = VALUES(github_updated_at)`,
      [
        releaseId,
        asset.githubReleaseId,
        repositoryId,
        asset.tagName,
        asset.releaseName || null,
        asset.releaseHtmlUrl || null,
        toMysqlDateTime(asset.publishedAt),
        asset.releaseCreatedAt ? toMysqlDateTime(asset.releaseCreatedAt) : null,
        asset.releaseUpdatedAt ? toMysqlDateTime(asset.releaseUpdatedAt) : null
      ]
    );

    await pool.execute<ResultSetHeader>(
      `INSERT INTO release_assets
         (id, github_asset_id, release_id, repository_id, name, label, content_type, size_bytes,
          browser_download_url, state, active, created_at_github, updated_at_github)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)
       ON DUPLICATE KEY UPDATE
         release_id = VALUES(release_id),
         repository_id = VALUES(repository_id),
         name = VALUES(name),
         label = VALUES(label),
         content_type = VALUES(content_type),
         size_bytes = VALUES(size_bytes),
         browser_download_url = VALUES(browser_download_url),
         state = VALUES(state),
         active = TRUE,
         created_at_github = VALUES(created_at_github),
         updated_at_github = VALUES(updated_at_github)`,
      [
        asset.id,
        asset.githubAssetId,
        releaseId,
        repositoryId,
        asset.assetName,
        asset.assetLabel || null,
        asset.assetContentType || null,
        asset.assetSizeBytes || 0,
        asset.browserDownloadUrl || null,
        asset.assetState || null,
        asset.assetCreatedAt ? toMysqlDateTime(asset.assetCreatedAt) : null,
        asset.assetUpdatedAt ? toMysqlDateTime(asset.assetUpdatedAt) : null
      ]
    );

    const [previousRows] = await pool.query<PreviousAssetSnapshotRow[]>(
      `SELECT download_count
       FROM release_asset_snapshots
       WHERE asset_id = ? AND snapshot_date < ?
       ORDER BY snapshot_date DESC
       LIMIT 1`,
      [asset.id, snapshotDate]
    );
    const previousCount = previousRows[0]?.download_count;
    const dailyDelta = typeof previousCount === "number" ? Math.max(0, asset.totalDownloads - previousCount) : 0;

    await pool.execute<ResultSetHeader>(
      `INSERT INTO release_asset_snapshots
         (id, asset_id, repository_id, snapshot_date, download_count, daily_delta)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         download_count = VALUES(download_count),
         daily_delta = VALUES(daily_delta)`,
      [
        `asset-snap-${asset.id}-${snapshotDate}`,
        asset.id,
        repositoryId,
        snapshotDate,
        asset.totalDownloads,
        dailyDelta
      ]
    );
  }
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
