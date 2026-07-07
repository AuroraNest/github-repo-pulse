> 本文是给 Codex 的页面级实现提示词。实现时请同时遵守 `docs/02_master_codex_prompt.md`、`docs/04_design_system.md` 和数据库/API 文档。

# 页面 04：Repository Detail 单仓库详情页

## 页面目标

展示单个仓库的完整分析。比如：

```text
AuroraNest/Modify_Positioning
```

回答：

> 这个仓库最近表现如何？谁在看？有没有人 clone？哪个 release asset 被下载？

## 路由

```text
/repositories/[owner]/[repo]
```

## UI 结构

参考 UI 图 `saas_仪表板概览.png`。

Header：

- Breadcrumb：Repositories > Modify_Positioning。
- Repo icon。
- Repo name。
- Star/favorite icon。
- Tags：Public/Private、language、last synced。
- Actions：Tracking toggle、Star link、GitHub link、menu。

KPI cards：

- Stars。
- Forks。
- 14-Day Views。
- 14-Day Clones。
- Total APK/Asset Downloads。
- Today’s New Downloads。

Tabs：

```text
Overview
Traffic
Releases
Reports
Settings
```

第一版可以只实现 Overview 内容，但 tabs 要预留。

## Overview Tab

内容：

1. 90-Day Growth Trends。
2. Views vs Clones。
3. Conversion Funnel：Visitors → Release Page Views → Downloads。
4. Popular Content table。
5. Referring Sites。

## API

```text
GET /api/repositories/:id/detail?range=90d
GET /api/repositories/:id/traffic?range=90d
GET /api/repositories/:id/releases
POST /api/repositories/:id/sync
PATCH /api/repositories/:id/settings
```

## Conversion Funnel 逻辑

尽量用已有数据估算：

```text
Visitors = 14/30/90 天 views 或 unique visitors
Release Page Views = popular paths 中包含 /releases 的 views
Downloads = release asset daily delta sum
```

注意：这是估算，不要写成绝对精准的用户转化率。tooltip 可写：

```text
Estimated from GitHub traffic paths and release asset download snapshots.
```

## Popular Content

字段：

```text
path/title
views
uniqueVisitors
share
```

显示最近一次 snapshot 或 range 内聚合。

## Referring Sites

字段：

```text
referrer
views
uniqueVisitors
share
```

## Empty State

如果仓库没有 releases：

```text
No release assets found. RepoPulse will start tracking downloads when a release asset appears.
```

如果 traffic forbidden：

```text
Traffic metrics are unavailable. Your token may need Administration read permission for this repository.
```

## Acceptance Criteria

- 点击仓库列表可进入详情页。
- KPI 与列表页一致。
- Traffic 权限不足时页面仍可显示 stars/forks/releases。
- 支持手动 Sync now。
- 图表和表格可切换时间范围。
