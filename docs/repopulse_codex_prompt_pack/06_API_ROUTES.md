# 06 - 后端 API 路由设计

## API 风格

所有 API 使用统一响应：

```ts
type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } }
```

所有写入 API 使用 Zod 校验。所有敏感 API 需要登录。

## Auth API

### POST /api/auth/login

请求：

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

返回：

```json
{ "ok": true, "data": { "user": { "email": "admin@example.com" } } }
```

### POST /api/auth/logout

清除 session。

### GET /api/auth/me

返回当前用户。

## Setup API

### GET /api/setup/status

返回：

```json
{
  "setupCompleted": false,
  "hasGitHubConnection": false,
  "trackedRepositoriesCount": 0
}
```

### POST /api/setup/verify-token

请求：

```json
{ "token": "github_pat_xxx" }
```

逻辑：

- 调 GitHub `/user`
- 拉取少量仓库测试权限
- 返回 account + permissions health
- 不保存 token，除非下一步确认

返回：

```json
{
  "account": {
    "login": "AuroraNest",
    "id": 75767774,
    "avatarUrl": "..."
  },
  "tokenMask": "github_pat_****abcd",
  "permissions": [
    { "name": "Read repository metadata", "ok": true },
    { "name": "Read traffic data", "ok": true },
    { "name": "Read releases", "ok": true }
  ]
}
```

### POST /api/setup/save-token

保存加密 token。

### GET /api/setup/repositories

列出可访问仓库。

Query：

```text
?search=&visibility=all&page=1&pageSize=50
```

### POST /api/setup/complete

请求：

```json
{
  "selectedRepositoryIds": [123, 456],
  "trackAll": false,
  "includePrivate": true,
  "syncCron": "0 8 * * *",
  "syncTimezone": "UTC",
  "dataRetentionDays": 365
}
```

逻辑：

- 设置 repositories.tracked
- 更新 app_settings
- setup_completed=true
- 触发第一次 sync 或提示用户手动 sync

## Overview API

### GET /api/overview

返回全局总览。

```json
{
  "kpis": {
    "totalStars": 12840,
    "totalForks": 3210,
    "totalDownloads": 98760,
    "downloadsToday": 2340,
    "visitors14d": 24680,
    "clones14d": 6320,
    "trackedRepositories": 18
  },
  "growthTrends": [],
  "viewsVsClones": [],
  "fastestGrowingRepositories": [],
  "topReleases": [],
  "activityFeed": []
}
```

## Repositories API

### GET /api/repositories

Query：

```text
?search=&tracked=true&visibility=all&language=&sort=stars&order=desc&page=1&pageSize=25
```

返回仓库表格数据。

### GET /api/repositories/:id

返回单仓库详情。

### PATCH /api/repositories/:id

请求：

```json
{ "tracked": true, "favorite": true }
```

### POST /api/repositories/:id/sync

手动同步一个仓库。

返回 sync run item 或 job id。

## Traffic API

### GET /api/repositories/:id/traffic

Query：

```text
?range=14d|30d|90d|custom&from=2026-01-01&to=2026-01-31
```

返回：

```json
{
  "daily": [
    { "date": "2026-07-01", "views": 10, "uniqueVisitors": 8, "clones": 2, "uniqueCloners": 2 }
  ],
  "popularPaths": [],
  "referrers": [],
  "conversion": {
    "visitors": 100,
    "releasePageViews": 20,
    "downloads": 8
  }
}
```

## Releases API

### GET /api/releases

全局 releases / assets 页面。

Query：

```text
?search=&repositoryId=&range=30d&sort=downloads&order=desc&page=1&pageSize=25
```

返回：

```json
{
  "kpis": {
    "totalReleaseDownloads": 98760,
    "downloadsToday": 2340,
    "activeReleases": 42,
    "mostDownloadedAsset": {
      "name": "Modify_Positioning-installable-f6fb4b9.apk",
      "downloads": 72
    }
  },
  "cumulativeDownloads": [],
  "dailyDownloadsByRepository": [],
  "assets": [],
  "topAssets": [],
  "recentActivity": []
}
```

### GET /api/repositories/:id/releases

单仓库 release 数据。

## Reports API

### GET /api/reports

Query：

```text
?type=daily&page=1&pageSize=20
```

### GET /api/reports/:id

返回报告内容。

### POST /api/reports/generate

请求：

```json
{ "type": "daily", "date": "2026-07-07", "useAI": true }
```

逻辑：

- 汇总指标
- 规则生成 report json
- 如果 AI enabled，则生成 AI summary
- 保存 markdown_content

### GET /api/reports/:id/export

Query：

```text
?format=markdown|json|csv|pdf
```

MVP 可以先做 markdown/json/csv，PDF 后做。

## Sync API

### GET /api/sync/runs

返回同步历史。

### GET /api/sync/runs/:id

返回具体 sync run 和 items。

### POST /api/sync/run

请求：

```json
{ "scope": "all" }
```

或：

```json
{ "scope": "repository", "repositoryId": "uuid" }
```

MVP 可以直接触发 worker 逻辑；更稳妥是写入 jobs 表让 worker pick。

### POST /api/sync/runs/:id/retry

重试失败仓库。

## Alerts API

### GET /api/alerts/rules

### POST /api/alerts/rules

请求：

```json
{
  "name": "Notify me when downloads spike by 20%",
  "metric": "downloads",
  "conditionType": "percentage_increase",
  "thresholdValue": 20,
  "windowDays": 1,
  "repositoryId": null,
  "channels": ["in_app"]
}
```

### PATCH /api/alerts/rules/:id

### DELETE /api/alerts/rules/:id

### GET /api/alerts/events

## Settings API

### GET /api/settings

返回：

- sync settings
- retention
- github connection status
- token mask
- AI status
- database status
- notification settings

### PATCH /api/settings

更新设置。

### POST /api/settings/github/reverify

重新验证 GitHub token。

### POST /api/settings/github/rotate-token

替换 token。

### POST /api/settings/ai/test

测试 AI 连接。

### POST /api/settings/export

导出数据。

### DELETE /api/settings/data

删除全部数据。必须请求：

```json
{ "confirmation": "DELETE" }
```

## AI API

### POST /api/ai/summarize

内部或手动使用。请求：

```json
{
  "purpose": "daily_report",
  "reportData": {}
}
```

返回：

```json
{ "summary": "...", "suggestedActions": [] }
```

没有配置 AI 时返回规则摘要，而不是失败。

## Health API

### GET /api/health

返回：

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "ok",
  "worker": "ok",
  "lastSyncAt": "..."
}
```

## API 验收标准

- 所有 API 有统一响应格式
- 未登录访问敏感 API 返回 401
- 所有写接口 Zod 校验
- Token 不会返回前端
- 错误信息可读
- 页面数据接口足够支撑 UI
- 手动 sync 能触发
- Reports 能导出 Markdown
