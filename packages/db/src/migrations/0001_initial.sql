CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR(64) PRIMARY KEY COMMENT 'Stable settings row identifier.',
  setup_completed BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether first-run setup has been completed.',
  sync_enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether scheduled repository sync is enabled.',
  sync_cron VARCHAR(64) NOT NULL DEFAULT '0 8 * * *' COMMENT 'Cron expression for scheduled sync.',
  sync_timezone VARCHAR(64) NOT NULL DEFAULT 'UTC' COMMENT 'Timezone used for scheduled sync.',
  data_retention_days INT NULL COMMENT 'Optional retention window for metric history.',
  ai_enabled BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether AI-assisted summaries are enabled.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time.',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update time.'
) COMMENT='RepoPulse application-wide settings.';

CREATE TABLE IF NOT EXISTS github_connections (
  id VARCHAR(64) PRIMARY KEY COMMENT 'Internal GitHub connection identifier.',
  provider VARCHAR(32) NOT NULL DEFAULT 'github' COMMENT 'Source control provider name.',
  account_login VARCHAR(255) NOT NULL COMMENT 'Connected GitHub account login.',
  account_id VARCHAR(64) NOT NULL COMMENT 'Connected GitHub account id.',
  account_avatar_url TEXT NULL COMMENT 'Connected account avatar URL.',
  token_mask VARCHAR(128) NOT NULL COMMENT 'Masked token for display only.',
  encrypted_token TEXT NOT NULL COMMENT 'Encrypted GitHub token ciphertext.',
  iv VARCHAR(64) NOT NULL COMMENT 'Token encryption initialization vector.',
  auth_tag VARCHAR(64) NOT NULL COMMENT 'Token encryption authentication tag.',
  scopes TEXT NULL COMMENT 'GitHub token scopes as returned by GitHub.',
  permissions_json JSON NULL COMMENT 'Verified permission health details.',
  last_verified_at DATETIME NULL COMMENT 'Last successful token verification time.',
  rate_limit_limit INT NULL COMMENT 'Last observed GitHub rate limit ceiling.',
  rate_limit_remaining INT NULL COMMENT 'Last observed remaining GitHub requests.',
  rate_limit_reset_at DATETIME NULL COMMENT 'Last observed rate limit reset time.',
  status VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT 'Connection state: active, error, or revoked.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time.',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update time.'
) COMMENT='Encrypted GitHub account connection metadata.';

CREATE TABLE IF NOT EXISTS repositories (
  id VARCHAR(64) PRIMARY KEY COMMENT 'Internal repository identifier.',
  github_repo_id BIGINT NOT NULL UNIQUE COMMENT 'Stable GitHub repository id.',
  owner VARCHAR(255) NOT NULL COMMENT 'Repository owner login.',
  name VARCHAR(255) NOT NULL COMMENT 'Repository short name.',
  full_name VARCHAR(512) NOT NULL UNIQUE COMMENT 'GitHub owner/name full repository name.',
  html_url TEXT NOT NULL COMMENT 'GitHub repository web URL.',
  clone_url TEXT NULL COMMENT 'Git clone URL.',
  description TEXT NULL COMMENT 'Repository description from GitHub.',
  visibility VARCHAR(32) NOT NULL COMMENT 'GitHub visibility: public, private, or internal.',
  is_private BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether the repository is private.',
  default_branch VARCHAR(255) NULL COMMENT 'Default Git branch.',
  primary_language VARCHAR(128) NULL COMMENT 'Primary language reported by GitHub.',
  license_key VARCHAR(128) NULL COMMENT 'GitHub license key.',
  archived BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether GitHub marks the repository archived.',
  disabled BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether GitHub marks the repository disabled.',
  fork BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether the repository is a fork.',
  tracked BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether RepoPulse should sync this repository.',
  favorite BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether the repository is pinned as a favorite in the UI.',
  tracking_enabled_at DATETIME NULL COMMENT 'When tracking was first enabled.',
  pushed_at DATETIME NULL COMMENT 'Last push time from GitHub.',
  github_created_at DATETIME NULL COMMENT 'Repository creation time from GitHub.',
  github_updated_at DATETIME NULL COMMENT 'Repository update time from GitHub.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time.',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update time.',
  INDEX idx_repositories_tracked (tracked),
  INDEX idx_repositories_full_name (full_name),
  INDEX idx_repositories_owner (owner)
) COMMENT='Discovered and tracked GitHub repositories.';

CREATE TABLE IF NOT EXISTS repository_snapshots (
  id VARCHAR(64) PRIMARY KEY COMMENT 'Internal repository snapshot identifier.',
  repository_id VARCHAR(64) NOT NULL COMMENT 'Repository that owns this daily snapshot.',
  snapshot_date DATE NOT NULL COMMENT 'Date represented by the snapshot.',
  stars_count INT NOT NULL DEFAULT 0 COMMENT 'Stargazer count at snapshot time.',
  forks_count INT NOT NULL DEFAULT 0 COMMENT 'Fork count at snapshot time.',
  watchers_count INT NOT NULL DEFAULT 0 COMMENT 'Watcher count at snapshot time.',
  subscribers_count INT NULL COMMENT 'Subscriber count when available.',
  open_issues_count INT NOT NULL DEFAULT 0 COMMENT 'Open issue count at snapshot time.',
  size_kb INT NULL COMMENT 'Repository size in KB.',
  network_count INT NULL COMMENT 'Network count when available.',
  release_count INT NULL COMMENT 'Release count at snapshot time.',
  latest_release_tag VARCHAR(255) NULL COMMENT 'Latest release tag at snapshot time.',
  latest_release_at DATETIME NULL COMMENT 'Latest release publish time.',
  total_release_downloads INT NOT NULL DEFAULT 0 COMMENT 'Total download count across latest asset snapshots.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time.',
  UNIQUE KEY uq_repository_snapshots_repo_date (repository_id, snapshot_date),
  CONSTRAINT fk_repository_snapshots_repository FOREIGN KEY (repository_id) REFERENCES repositories(id)
) COMMENT='Daily repository metric snapshots.';

CREATE TABLE IF NOT EXISTS traffic_daily (
  id VARCHAR(64) PRIMARY KEY COMMENT 'Internal traffic daily identifier.',
  repository_id VARCHAR(64) NOT NULL COMMENT 'Repository that owns this traffic record.',
  metric VARCHAR(16) NOT NULL COMMENT 'Traffic metric type: views or clones.',
  traffic_date DATE NOT NULL COMMENT 'Date represented by this traffic value.',
  count INT NOT NULL DEFAULT 0 COMMENT 'Total traffic count.',
  uniques INT NOT NULL DEFAULT 0 COMMENT 'Unique traffic count.',
  last_seen_snapshot_date DATE NOT NULL COMMENT 'Most recent sync snapshot date that returned this traffic day.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time.',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update time.',
  UNIQUE KEY uq_traffic_daily_repo_metric_date (repository_id, metric, traffic_date),
  CONSTRAINT fk_traffic_daily_repository FOREIGN KEY (repository_id) REFERENCES repositories(id)
) COMMENT='Daily GitHub traffic values preserved from rolling API windows.';

CREATE TABLE IF NOT EXISTS traffic_summary_snapshots (
  id VARCHAR(64) PRIMARY KEY COMMENT 'Internal traffic summary snapshot identifier.',
  repository_id VARCHAR(64) NOT NULL COMMENT 'Repository that owns this traffic summary.',
  snapshot_date DATE NOT NULL COMMENT 'Date this 14-day summary was captured.',
  views_count_14d INT NOT NULL DEFAULT 0 COMMENT 'GitHub 14-day views count.',
  views_uniques_14d INT NOT NULL DEFAULT 0 COMMENT 'GitHub 14-day unique viewers.',
  clones_count_14d INT NOT NULL DEFAULT 0 COMMENT 'GitHub 14-day clone count.',
  clones_uniques_14d INT NOT NULL DEFAULT 0 COMMENT 'GitHub 14-day unique cloners.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time.',
  UNIQUE KEY uq_traffic_summary_repo_date (repository_id, snapshot_date),
  CONSTRAINT fk_traffic_summary_repository FOREIGN KEY (repository_id) REFERENCES repositories(id)
) COMMENT='GitHub rolling 14-day traffic summary snapshots.';

CREATE TABLE IF NOT EXISTS popular_path_snapshots (
  id VARCHAR(64) PRIMARY KEY COMMENT 'Internal popular path snapshot identifier.',
  repository_id VARCHAR(64) NOT NULL COMMENT 'Repository that owns this popular path value.',
  snapshot_date DATE NOT NULL COMMENT 'Date this rolling-window value was captured.',
  path TEXT NOT NULL COMMENT 'Popular GitHub path.',
  title TEXT NULL COMMENT 'GitHub path title.',
  count INT NOT NULL DEFAULT 0 COMMENT 'Path view count in the GitHub window.',
  uniques INT NOT NULL DEFAULT 0 COMMENT 'Unique visitor count in the GitHub window.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time.',
  UNIQUE KEY uq_popular_path_repo_date_path (repository_id, snapshot_date, path(255)),
  CONSTRAINT fk_popular_path_repository FOREIGN KEY (repository_id) REFERENCES repositories(id)
) COMMENT='Rolling-window GitHub popular path snapshots.';

CREATE TABLE IF NOT EXISTS referrer_snapshots (
  id VARCHAR(64) PRIMARY KEY COMMENT 'Internal referrer snapshot identifier.',
  repository_id VARCHAR(64) NOT NULL COMMENT 'Repository that owns this referrer value.',
  snapshot_date DATE NOT NULL COMMENT 'Date this rolling-window value was captured.',
  referrer VARCHAR(512) NOT NULL COMMENT 'Referring site or source.',
  count INT NOT NULL DEFAULT 0 COMMENT 'Referrer count in the GitHub window.',
  uniques INT NOT NULL DEFAULT 0 COMMENT 'Unique referrer visitor count.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time.',
  UNIQUE KEY uq_referrer_repo_date_referrer (repository_id, snapshot_date, referrer),
  CONSTRAINT fk_referrer_repository FOREIGN KEY (repository_id) REFERENCES repositories(id)
) COMMENT='Rolling-window GitHub referrer snapshots.';

CREATE TABLE IF NOT EXISTS releases (
  id VARCHAR(64) PRIMARY KEY COMMENT 'Internal release identifier.',
  github_release_id BIGINT NOT NULL UNIQUE COMMENT 'Stable GitHub release id.',
  repository_id VARCHAR(64) NOT NULL COMMENT 'Repository that owns this release.',
  tag_name VARCHAR(255) NOT NULL COMMENT 'Release tag name.',
  target_commitish VARCHAR(255) NULL COMMENT 'Target branch or commit.',
  name VARCHAR(255) NULL COMMENT 'Release display name.',
  body MEDIUMTEXT NULL COMMENT 'Release notes body.',
  html_url TEXT NULL COMMENT 'GitHub release URL.',
  draft BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether this release is a draft.',
  prerelease BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether this release is a prerelease.',
  published_at DATETIME NULL COMMENT 'Release publish time.',
  github_created_at DATETIME NULL COMMENT 'Release creation time from GitHub.',
  github_updated_at DATETIME NULL COMMENT 'Release update time from GitHub.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time.',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update time.',
  UNIQUE KEY uq_releases_repo_tag (repository_id, tag_name),
  CONSTRAINT fk_releases_repository FOREIGN KEY (repository_id) REFERENCES repositories(id)
) COMMENT='GitHub releases for tracked repositories.';

CREATE TABLE IF NOT EXISTS release_assets (
  id VARCHAR(64) PRIMARY KEY COMMENT 'Internal release asset identifier.',
  github_asset_id BIGINT NOT NULL UNIQUE COMMENT 'Stable GitHub release asset id.',
  release_id VARCHAR(64) NOT NULL COMMENT 'Release that owns this asset.',
  repository_id VARCHAR(64) NOT NULL COMMENT 'Repository that owns this asset.',
  name VARCHAR(512) NOT NULL COMMENT 'Asset file name.',
  label VARCHAR(512) NULL COMMENT 'Optional GitHub asset label.',
  content_type VARCHAR(255) NULL COMMENT 'Asset MIME content type.',
  size_bytes BIGINT NOT NULL DEFAULT 0 COMMENT 'Asset size in bytes.',
  browser_download_url TEXT NULL COMMENT 'Public GitHub download URL.',
  state VARCHAR(64) NULL COMMENT 'GitHub asset state.',
  active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether the asset is still seen in latest GitHub data.',
  created_at_github DATETIME NULL COMMENT 'Asset creation time from GitHub.',
  updated_at_github DATETIME NULL COMMENT 'Asset update time from GitHub.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time.',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update time.',
  CONSTRAINT fk_release_assets_release FOREIGN KEY (release_id) REFERENCES releases(id),
  CONSTRAINT fk_release_assets_repository FOREIGN KEY (repository_id) REFERENCES repositories(id)
) COMMENT='GitHub release assets and download targets.';

CREATE TABLE IF NOT EXISTS release_asset_snapshots (
  id VARCHAR(64) PRIMARY KEY COMMENT 'Internal release asset snapshot identifier.',
  asset_id VARCHAR(64) NOT NULL COMMENT 'Asset that owns this download snapshot.',
  repository_id VARCHAR(64) NOT NULL COMMENT 'Repository that owns this asset snapshot.',
  snapshot_date DATE NOT NULL COMMENT 'Date represented by this asset snapshot.',
  download_count INT NOT NULL DEFAULT 0 COMMENT 'Cumulative GitHub asset download count.',
  daily_delta INT NOT NULL DEFAULT 0 COMMENT 'Calculated day-over-day download increment.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time.',
  UNIQUE KEY uq_release_asset_snapshots_asset_date (asset_id, snapshot_date),
  CONSTRAINT fk_release_asset_snapshots_asset FOREIGN KEY (asset_id) REFERENCES release_assets(id),
  CONSTRAINT fk_release_asset_snapshots_repository FOREIGN KEY (repository_id) REFERENCES repositories(id)
) COMMENT='Daily release asset download snapshots.';

CREATE TABLE IF NOT EXISTS sync_runs (
  id VARCHAR(64) PRIMARY KEY COMMENT 'Internal sync run identifier.',
  trigger_source VARCHAR(32) NOT NULL COMMENT 'Sync trigger: schedule, manual, setup, or api.',
  status VARCHAR(32) NOT NULL COMMENT 'Run status: running, success, partial_failed, failed, or cancelled.',
  started_at DATETIME NOT NULL COMMENT 'Sync start time.',
  finished_at DATETIME NULL COMMENT 'Sync finish time.',
  duration_ms INT NULL COMMENT 'Sync duration in milliseconds.',
  total_repositories INT NOT NULL DEFAULT 0 COMMENT 'Repositories planned for this sync.',
  success_count INT NOT NULL DEFAULT 0 COMMENT 'Repositories synced successfully.',
  failed_count INT NOT NULL DEFAULT 0 COMMENT 'Repositories that failed or partially failed.',
  rate_limit_remaining INT NULL COMMENT 'Remaining GitHub API rate limit after sync.',
  rate_limit_reset_at DATETIME NULL COMMENT 'GitHub API rate limit reset time after sync.',
  error_message TEXT NULL COMMENT 'Top-level sync error message.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time.'
) COMMENT='Top-level repository sync run records.';

CREATE TABLE IF NOT EXISTS sync_run_items (
  id VARCHAR(64) PRIMARY KEY COMMENT 'Internal sync run item identifier.',
  sync_run_id VARCHAR(64) NOT NULL COMMENT 'Parent sync run.',
  repository_id VARCHAR(64) NOT NULL COMMENT 'Repository synced by this item.',
  status VARCHAR(32) NOT NULL COMMENT 'Item status: pending, running, success, failed, or skipped.',
  started_at DATETIME NULL COMMENT 'Item start time.',
  finished_at DATETIME NULL COMMENT 'Item finish time.',
  duration_ms INT NULL COMMENT 'Item duration in milliseconds.',
  collected_repo BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether repository metadata was collected.',
  collected_traffic BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether traffic data was collected.',
  collected_releases BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether release data was collected.',
  error_code VARCHAR(64) NULL COMMENT 'Stable error code for UI handling.',
  error_message TEXT NULL COMMENT 'Human-readable item error message.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time.',
  CONSTRAINT fk_sync_run_items_run FOREIGN KEY (sync_run_id) REFERENCES sync_runs(id),
  CONSTRAINT fk_sync_run_items_repository FOREIGN KEY (repository_id) REFERENCES repositories(id)
) COMMENT='Per-repository sync run item outcomes.';

CREATE TABLE IF NOT EXISTS activity_events (
  id VARCHAR(64) PRIMARY KEY COMMENT 'Internal activity event identifier.',
  repository_id VARCHAR(64) NULL COMMENT 'Related repository when applicable.',
  event_type VARCHAR(64) NOT NULL COMMENT 'Event type used by feeds and alerts.',
  severity VARCHAR(16) NOT NULL DEFAULT 'info' COMMENT 'Event severity: info, success, warning, or error.',
  title VARCHAR(512) NOT NULL COMMENT 'Short event title.',
  details_json JSON NULL COMMENT 'Structured event details.',
  happened_at DATETIME NOT NULL COMMENT 'Business time of the event.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time.',
  CONSTRAINT fk_activity_events_repository FOREIGN KEY (repository_id) REFERENCES repositories(id)
) COMMENT='Activity feed events derived from sync and report outcomes.';

CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(64) PRIMARY KEY COMMENT 'Internal report identifier.',
  report_type VARCHAR(32) NOT NULL COMMENT 'Report type: daily, weekly, or monthly.',
  period_start DATE NOT NULL COMMENT 'Report period start date.',
  period_end DATE NOT NULL COMMENT 'Report period end date.',
  title VARCHAR(512) NOT NULL COMMENT 'Report display title.',
  summary TEXT NOT NULL COMMENT 'Rule-based or AI-assisted summary.',
  data_json JSON NOT NULL COMMENT 'Structured report data used by the UI.',
  markdown_content MEDIUMTEXT NOT NULL COMMENT 'Markdown export content.',
  ai_generated BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether AI was used for natural-language content.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time.'
) COMMENT='Generated RepoPulse analytics reports.';
