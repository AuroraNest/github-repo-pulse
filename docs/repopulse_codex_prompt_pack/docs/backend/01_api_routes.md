# Backend 01：API Routes 设计

## API 原则

- 所有 API 返回统一 JSON 格式。
- 所有输入用 zod 校验。
- 所有错误用标准 code。
- 不返回敏感字段。
- 支持 demo mode。

## 统一响应

成功：

```json
{
  "ok": true,
  "data": {}
}
```

失败：

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "GitHub token is invalid or expired.",
    "details": {}
  }
}
```

## Setup APIs

```text
GET  /api/setup/status
POST /api/setup/verify-token
POST /api/setup/discover-repositories
POST /api/setup/complete
```

## Dashboard APIs

```text
GET /api/dashboard/overview?range=30d
GET /api/dashboard/activity-feed?limit=20
```

## Repository APIs

```text
GET    /api/repositories
GET    /api/repositories/:id
PATCH  /api/repositories/:id
POST   /api/repositories/:id/sync
GET    /api/repositories/:id/detail?range=90d
GET    /api/repositories/:id/traffic?range=90d
GET    /api/repositories/:id/releases
```

## Release APIs

```text
GET /api/releases/summary?range=30d
GET /api/releases/assets
GET /api/releases/assets/:id/history
GET /api/releases/activity
```

## Report APIs

```text
GET  /api/reports
GET  /api/reports/:id
POST /api/reports/generate
POST /api/reports/:id/regenerate-ai
GET  /api/reports/:id/export?format=markdown|csv|pdf
```

## Job APIs

```text
GET  /api/jobs/current
POST /api/jobs/sync-now
POST /api/jobs/cancel-current
```

## Activity APIs

```text
GET  /api/activity/sync-runs
GET  /api/activity/sync-runs/:id
POST /api/activity/sync-runs/:id/retry-failed
GET  /api/activity/events
```

## Alert APIs

```text
GET    /api/alerts/rules
POST   /api/alerts/rules
PATCH  /api/alerts/rules/:id
DELETE /api/alerts/rules/:id
GET    /api/alerts/events
POST   /api/alerts/events/:id/acknowledge
```

## Settings APIs

```text
GET   /api/settings
PATCH /api/settings
POST  /api/settings/test-github
POST  /api/settings/test-ai
POST  /api/settings/export
POST  /api/settings/backup
POST  /api/settings/delete-all-data
```

## AI APIs

```text
POST /api/ai/test
POST /api/ai/generate-report-summary
```

## 认证策略

MVP 单用户自托管，可以先用：

- Setup 后设置一个 admin password；或
- 环境变量 `ADMIN_PASSWORD`；或
- 本地网络默认不强制登录，但文档强烈建议反向代理保护。

推荐第一版实现简单 session：

- `/login`
- bcrypt password hash。
- httpOnly cookie。

如果时间紧，可先加 `DISABLE_AUTH=true`，默认 Docker 本地部署打开。正式 release 前建议默认 auth on。

## API 实现注意事项

- API Route 不能直接调用 GitHub API 后到处写数据库，应该调用 service。
- 所有 handler 要 try/catch。
- 错误日志不包含 token。
- 对手动 sync 做幂等和防重复。
- 导出接口要 stream 或生成临时文件。
