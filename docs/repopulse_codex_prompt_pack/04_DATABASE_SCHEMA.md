# 04 - 数据库 Schema 设计

## 数据库原则

MVP 默认 SQLite。数据模型要支持长期历史快照、每日增量、报告、同步日志、AI 总结和告警。

关键原则：

- GitHub id 优先作为外部对象稳定标识
- 每日快照按 `snapshot_date` upsert
- Release asset 使用 GitHub asset id，不只用文件名
- Traffic daily 数据按 repo + date + metric 唯一
- Popular paths/referrers 是 14 天窗口快照，要按 snapshot_date 保存
- 所有同步操作都有 sync_runs 和 sync_run_items
- 不明文存 token

## 主要表

### app_settings

存系统设置。

字段：

```text
id                     text primary key
setup_completed         boolean default false
sync_enabled            boolean default true
sync_cron               text default '0 8 * * *'
sync_timezone           text default 'UTC'
data_retention_days     integer nullable
ai_enabled              boolean default false
created_at              datetime
updated_at              datetime
```

### github_connections

GitHub 连接信息。

```text
id                       text primary key
provider                 text default 'github'
account_login            text
account_id               text
account_avatar_url       text nullable
token_mask               text
encrypted_token          text
iv                       text
auth_tag                 text
scopes                   text nullable
permissions_json         text nullable
last_verified_at         datetime nullable
rate_limit_limit         integer nullable
rate_limit_remaining     integer nullable
rate_limit_reset_at      datetime nullable
status                   text default 'active' -- active/error/revoked
created_at               datetime
updated_at               datetime
```

### repositories

被发现或被监控的仓库。

```text
id                       text primary key -- internal uuid
github_repo_id           integer unique
owner                    text
name                     text
full_name                text unique
html_url                 text
clone_url                text nullable
description              text nullable
visibility               text -- public/private/internal
is_private               boolean
default_branch           text nullable
primary_language         text nullable
license_key              text nullable
archived                 boolean default false
disabled                 boolean default false
fork                     boolean default false
tracked                  boolean default false
tracking_enabled_at      datetime nullable
pushed_at                datetime nullable
github_created_at        datetime nullable
github_updated_at        datetime nullable
created_at               datetime
updated_at               datetime
```

索引：

```text
idx_repositories_tracked
idx_repositories_full_name
idx_repositories_owner
```

### repository_topics

```text
id               text primary key
repository_id    text references repositories(id)
topic            text
created_at       datetime
unique(repository_id, topic)
```

### repository_snapshots

每日仓库基础指标快照。

```text
id                       text primary key
repository_id            text references repositories(id)
snapshot_date            date
stars_count              integer default 0
forks_count              integer default 0
watchers_count           integer default 0
subscribers_count        integer nullable
open_issues_count        integer default 0
size_kb                  integer nullable
network_count            integer nullable
release_count            integer nullable
latest_release_tag       text nullable
latest_release_at        datetime nullable
total_release_downloads  integer default 0
created_at               datetime
unique(repository_id, snapshot_date)
```

派生指标：今日新增 stars = 今日 snapshot - 昨日 snapshot。

### traffic_daily

GitHub traffic views / clones 的每日值。

```text
id                       text primary key
repository_id            text references repositories(id)
metric                   text -- views/clones
traffic_date             date
count                    integer default 0
uniques                  integer default 0
last_seen_snapshot_date  date
created_at               datetime
updated_at               datetime
unique(repository_id, metric, traffic_date)
```

说明：GitHub traffic API 每次返回最近窗口内的 daily breakdown。每次同步时，对每个日期 upsert。这样即使窗口滚动，也能永久保存过去每天的数据。

### traffic_summary_snapshots

每次同步时 GitHub 给出的 14 天总览。

```text
id                       text primary key
repository_id            text references repositories(id)
snapshot_date            date
views_count_14d          integer default 0
views_uniques_14d        integer default 0
clones_count_14d         integer default 0
clones_uniques_14d       integer default 0
created_at               datetime
unique(repository_id, snapshot_date)
```

### popular_path_snapshots

GitHub popular paths 是当前窗口聚合，因此按 snapshot_date 保存。

```text
id                       text primary key
repository_id            text references repositories(id)
snapshot_date            date
path                     text
title                    text nullable
count                    integer default 0
uniques                  integer default 0
created_at               datetime
unique(repository_id, snapshot_date, path)
```

### referrer_snapshots

```text
id                       text primary key
repository_id            text references repositories(id)
snapshot_date            date
referrer                 text
count                    integer default 0
uniques                  integer default 0
created_at               datetime
unique(repository_id, snapshot_date, referrer)
```

### releases

```text
id                       text primary key
github_release_id        integer unique
repository_id            text references repositories(id)
tag_name                 text
target_commitish         text nullable
name                     text nullable
body                     text nullable
html_url                 text nullable
draft                    boolean default false
prerelease               boolean default false
published_at             datetime nullable
github_created_at        datetime nullable
github_updated_at        datetime nullable
created_at               datetime
updated_at               datetime
unique(repository_id, tag_name)
```

### release_assets

```text
id                       text primary key
github_asset_id          integer unique
release_id               text references releases(id)
repository_id            text references repositories(id)
name                     text
label                    text nullable
content_type             text nullable
size_bytes               integer default 0
browser_download_url     text nullable
state                    text nullable
created_at_github        datetime nullable
updated_at_github        datetime nullable
created_at               datetime
updated_at               datetime
```

### release_asset_snapshots

每日 asset 下载快照。

```text
id                       text primary key
asset_id                 text references release_assets(id)
repository_id            text references repositories(id)
snapshot_date            date
download_count           integer default 0
daily_delta              integer default 0
created_at               datetime
unique(asset_id, snapshot_date)
```

计算：

```text
daily_delta = max(0, today.download_count - previous.download_count)
```

如果 asset 被重新上传导致 GitHub asset id 改变，不要强行合并，保留为新 asset。

### sync_runs

```text
id                       text primary key
trigger                  text -- schedule/manual/setup/api
status                   text -- running/success/partial_failed/failed/cancelled
started_at               datetime
finished_at              datetime nullable
duration_ms              integer nullable
total_repositories       integer default 0
success_count            integer default 0
failed_count             integer default 0
rate_limit_remaining     integer nullable
rate_limit_reset_at      datetime nullable
error_message            text nullable
created_at               datetime
```

### sync_run_items

```text
id                       text primary key
sync_run_id              text references sync_runs(id)
repository_id            text references repositories(id)
status                   text -- pending/running/success/failed/skipped
started_at               datetime nullable
finished_at              datetime nullable
duration_ms              integer nullable
collected_repo           boolean default false
collected_traffic        boolean default false
collected_releases       boolean default false
error_code               text nullable
error_message            text nullable
created_at               datetime
```

### activity_events

用于 Overview activity feed。

```text
id                       text primary key
repository_id            text nullable references repositories(id)
event_type               text -- star_growth/download_spike/sync_failed/release_published/report_generated
severity                 text -- info/success/warning/error
message                  text
metadata_json            text nullable
event_date               date
created_at               datetime
```

### reports

```text
id                       text primary key
report_type              text -- daily/weekly/monthly
period_start             date
period_end               date
title                    text
summary                  text
markdown_content         text
json_data                text
ai_generated             boolean default false
ai_provider              text nullable
ai_model                 text nullable
status                   text -- generated/failed
created_at               datetime
updated_at               datetime
unique(report_type, period_start, period_end)
```

### alert_rules

```text
id                       text primary key
name                     text
metric                   text -- downloads/stars/forks/views/clones/sync_failure
condition_type           text -- percentage_increase/absolute_threshold/drop/spike
threshold_value          real
window_days              integer default 1
repository_id            text nullable references repositories(id)
enabled                  boolean default true
channels_json            text nullable
created_at               datetime
updated_at               datetime
```

### alert_events

```text
id                       text primary key
alert_rule_id            text references alert_rules(id)
repository_id            text nullable references repositories(id)
message                  text
severity                 text
metric_value             real nullable
status                   text -- open/acknowledged/resolved
created_at               datetime
```

### ai_settings

```text
id                       text primary key
provider                 text
base_url                 text nullable
model                    text nullable
enabled                  boolean default false
api_key_mask             text nullable
encrypted_api_key        text nullable
iv                       text nullable
auth_tag                 text nullable
created_at               datetime
updated_at               datetime
```

### ai_runs

```text
id                       text primary key
purpose                  text -- daily_report/anomaly_explanation/chat
provider                 text
model                    text nullable
status                   text -- success/failed/skipped
input_hash               text nullable
output_text              text nullable
error_message            text nullable
created_at               datetime
```

## 查询视图建议

可以在代码层实现，不一定建 SQL view。

### repo_current_metrics

每个 repo 的最新 snapshot + 14d traffic + release download 总数。

### asset_download_deltas

每个 asset 的今日、7 日、30 日新增下载。

### overview_metrics

全局总览：

- total_stars
- total_forks
- total_downloads
- downloads_today
- visitors_14d
- clones_14d
- tracked_repositories_count
- active_alerts_count

## 数据保留

默认保留 12 个月或无限。

用户可以设置：

- 30 天
- 90 天
- 12 个月
- Forever

清理策略：

- 不清理 repositories / releases / assets 基础表
- 可清理 old snapshots / sync logs / reports
- 清理前写日志

## 迁移要求

- 所有表要有 created_at / updated_at
- migrations 可重复执行
- 不要破坏用户已有 SQLite 数据
- 给后续 MySQL/PostgreSQL 留字段类型余地
