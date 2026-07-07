> 本文是给 Codex 的页面级实现提示词。实现时请同时遵守 `docs/02_master_codex_prompt.md`、`docs/04_design_system.md` 和数据库/API 文档。

# 页面 08：Activity / Sync Logs 同步日志页

## 页面目标

展示系统后台同步、采集、报告生成、告警触发等活动日志。

这是排错页面，尤其对开源自托管用户很重要。

## 路由

```text
/activity
```

## 功能

- 查看所有 sync runs。
- 查看某次 sync run 的每个仓库结果。
- 查看失败原因。
- 查看 GitHub rate limit。
- 手动重试失败仓库。
- 查看报告生成日志。
- 查看 AI 调用日志。

## UI 结构

顶部 KPI：

- Last Sync Status。
- Last Sync Duration。
- Failed Repositories。
- Rate Limit Remaining。

主区域：

- Sync Runs table。
- 右侧/Drawer：Sync Run Detail。

Sync Runs 表格列：

```text
Run ID
Trigger
Scope
Status
Started At
Duration
Repositories
Success/Failed
Rate Limit
Actions
```

Run Detail：

```text
Repository
Status
Duration
Steps
Error
Retry
```

## API

```text
GET /api/activity/sync-runs?page=&status=
GET /api/activity/sync-runs/:id
POST /api/activity/sync-runs/:id/retry-failed
GET /api/activity/events
```

## 状态展示

- success：绿色。
- partial_success：黄色。
- failed：红色。
- running：蓝色 spinner。

## 错误规范化

错误 code 示例：

```text
INVALID_TOKEN
RATE_LIMIT_EXCEEDED
SECONDARY_RATE_LIMIT
TRAFFIC_FORBIDDEN
REPO_NOT_FOUND
NETWORK_ERROR
UNKNOWN_ERROR
```

## Acceptance Criteria

- 同步失败时用户能看到原因。
- 可以重试失败项。
- 日志不包含 token。
- Running 状态可轮询刷新。
