export const businessTables = [
  "app_settings",
  "github_connections",
  "repositories",
  "repository_snapshots",
  "traffic_daily",
  "traffic_summary_snapshots",
  "popular_path_snapshots",
  "referrer_snapshots",
  "releases",
  "release_assets",
  "release_asset_snapshots",
  "sync_runs",
  "sync_run_items",
  "activity_events",
  "reports"
] as const;

export type BusinessTableName = (typeof businessTables)[number];

export const initialMigration = "packages/db/src/migrations/0001_initial.sql";
