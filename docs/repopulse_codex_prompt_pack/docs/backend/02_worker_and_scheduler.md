# Backend 02：Worker 与 Scheduler

## 目标

RepoPulse 需要一个可靠的后台 worker，每天自动同步数据。

## 运行方式

Docker Compose 启动两个服务：

```yaml
services:
  web:
    image: repopulse
    command: pnpm start
  worker:
    image: repopulse
    command: pnpm worker
```

MySQL 数据库通过 Docker service 共享：

```yaml
services:
  mysql:
    image: mysql:8.4
    volumes:
      - mysql_data:/var/lib/mysql
```

## Worker 入口

```text
src/worker.ts
```

职责：

1. 加载 env。
2. 初始化 db。
3. 启动 scheduler。
4. 监听 SIGTERM/SIGINT 优雅退出。

## Scheduler

实现 `src/server/jobs/scheduler.ts`。

- 从 settings 读取 cron/timezone。
- 默认每天 08:00。
- 支持手动触发。
- 防止重复运行。

## Sync Job

实现 `syncAllTrackedRepositories(trigger)`。

流程：

1. 检查是否已有 running sync。
2. 创建 sync_run。
3. 查找 tracked repos。
4. 按并发限制同步每个 repo。
5. 更新 sync_run 状态。
6. 生成 reports。
7. 执行 alert rules。
8. 清理 retention 过期数据。

## 并发

默认：

```env
SYNC_CONCURRENCY=2
```

不要太高，避免 GitHub secondary rate limit。

## 防重复锁

可以用数据库 settings/locks 表，或者 sync_runs running 状态。

建议实现 `job_locks` 表：

```text
id
name unique
lockedAt
expiresAt
owner
```

MVP 简化：如果存在 `sync_runs.status=running` 且 startedAt 在 6 小时内，则拒绝新的 all sync。

## 手动同步

当用户点击 Sync now：

- API 创建一个 trigger 请求。
- 如果 worker 同进程不可达，API 可直接调用 sync service。
- 或者把 job 写入 `job_queue` 表，worker 轮询。

MVP 简化：API 直接启动 async sync，但要注意 Next.js server 生命周期。更稳的方式：写 `job_queue` 表。

推荐实现轻量 `job_queue`：

```text
id
type = sync_all | sync_repo | generate_report
payloadJson
status = pending | running | success | failed
attempts
availableAt
createdAt
updatedAt
```

worker 每 10 秒 poll pending jobs。

## 日志

使用 pino：

```text
logger.info({ syncRunId, repo: fullName }, 'sync repo started')
```

不要输出 token。

## Health

API：

```text
GET /api/health
GET /api/jobs/current
```

返回：

- worker last heartbeat。
- current running job。
- pending jobs count。
- last sync result。

## Acceptance Criteria

- worker 能按计划自动同步。
- sync run 和 item 都有记录。
- 失败不影响其他仓库。
- 手动同步可用。
- 重复点击不会创建多个并行全量同步。
