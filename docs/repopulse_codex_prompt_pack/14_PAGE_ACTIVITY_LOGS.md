# 14 - 页面：Activity / Sync Logs 同步日志页

## 页面作用

排查同步、权限、API rate limit、collector 错误。

回答问题：

> 为什么今天没数据？哪个仓库同步失败？Token 权限够不够？

## 路由

```text
/activity
```

也可以叫：

```text
/sync-logs
```

## 页面顶部 KPI

- Last Sync Status
- Last Successful Sync
- Repositories Synced
- Failed Repositories
- API Rate Limit Remaining

## Sync Runs Table

列：

```text
Run ID
Trigger
Status
Started At
Duration
Total Repositories
Success
Failed
Rate Limit
Actions
```

Actions：

- View details
- Retry failed
- Download log

## Sync Run Detail Drawer / Page

显示 sync_run_items。

列：

```text
Repository
Status
Repo Metadata
Traffic
Releases
Duration
Error Code
Error Message
```

## Activity Feed

全局事件流：

- new release published
- download spike
- star milestone
- sync failed
- traffic permission missing
- AI report generated

## 错误提示映射

### GITHUB_UNAUTHORIZED

文案：

```text
GitHub token is invalid or revoked. Please reconnect GitHub.
```

### TRAFFIC_PERMISSION_MISSING

```text
Repository metadata was collected, but Traffic data could not be accessed. Update your GitHub token permissions.
```

### GITHUB_RATE_LIMITED

```text
GitHub API rate limit reached. RepoPulse will retry after reset time.
```

## API

```text
GET /api/sync/runs
GET /api/sync/runs/:id
POST /api/sync/runs/:id/retry
GET /api/activity/events
```

## MVP 可以如何简化

第一版可以只做：

- 最近 20 次 sync run
- 每次 run 的成功/失败数量
- 点击查看失败仓库和 error message
- Retry failed

## UI 要求

- 偏运维工具，但仍保持优雅
- 错误信息要清楚
- 不要把 stack trace 默认展示给普通用户
- 提供 copy error 按钮

## 验收标准

- 每次同步都有记录
- 失败仓库能查到原因
- 可以重试失败项
- rate limit 状态可见
- Token 权限问题可识别
