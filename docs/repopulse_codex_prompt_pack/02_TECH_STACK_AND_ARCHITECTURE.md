# 02 - 技术栈与架构

## 总体架构

RepoPulse 建议采用 **Web + Worker + DB** 的架构。

```text
Browser
  ↓
Next.js Web App
  ↓
API Route / Server Actions
  ↓
Database

Worker Process
  ↓
GitHub API
  ↓
Database
```

Web 负责 UI、查询、配置、手动触发同步。Worker 负责定时任务、调用 GitHub API、计算快照、生成报告、触发告警。

## 推荐技术栈

### 前端

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Recharts
- TanStack Table
- Zustand 或 React Context 做轻量 UI 状态

### 后端

- Next.js Route Handlers
- TypeScript
- Zod 做请求校验
- Octokit REST 调 GitHub API
- Drizzle ORM 操作数据库

### Worker

- Node.js TypeScript
- node-cron 定时任务
- pino 或 consola 日志
- 复用 packages/core 和 packages/db

### 数据库

当前实现选择 MySQL-first。

原因：

- 用户当前 dev 环境已经选择 MySQL
- Docker Compose 可以用 `mysql` service + volume 一键启动
- 适合后续迁移到云服务器和长期数据持久化
- 仍保留数据库访问隔离, 后续可补 PostgreSQL/SQLite adapter

代码里不要把 SQL 写死在业务层。所有数据库访问放进 `packages/db`。

### AI

AI 模块必须是可选的。

支持方式：

- OpenAI-compatible API
- OpenRouter
- Ollama
- 用户自定义 `AI_BASE_URL`

如果用户没有配置 AI，则用规则生成报告。

## Monorepo 目录结构

建议结构：

```text
repopulse/
  apps/
    web/
      app/
        layout.tsx
        page.tsx
        setup/page.tsx
        repositories/page.tsx
        repositories/[id]/page.tsx
        releases/page.tsx
        reports/page.tsx
        activity/page.tsx
        alerts/page.tsx
        settings/page.tsx
        api/
      components/
        layout/
        charts/
        cards/
        tables/
        forms/
        reports/
      lib/
        api-client.ts
        format.ts
        auth.ts
      styles/
    worker/
      src/
        index.ts
        scheduler.ts
        jobs/
          sync-all-repositories.ts
          sync-one-repository.ts
          generate-daily-report.ts
        collectors/
          github-repo-collector.ts
          github-traffic-collector.ts
          github-release-collector.ts
        utils/
  packages/
    db/
      src/
        schema.ts
        client.ts
        migrations/
        queries/
    core/
      src/
        github/
          client.ts
          types.ts
        metrics/
          derive.ts
          anomalies.ts
          growth.ts
        reports/
          daily-report.ts
          markdown.ts
        ai/
          provider.ts
          prompts.ts
          summarize.ts
        security/
          crypto.ts
        config/
          env.ts
  docs/
  docker-compose.yml
  Dockerfile.web
  Dockerfile.worker
  .env.example
  README.md
  LICENSE
  package.json
  pnpm-workspace.yaml
```

如果你想更简单，也可以先做单包结构：

```text
src/
  app/
  components/
  server/
  worker/
  db/
  core/
```

但无论采用哪种结构，业务边界必须清楚。

## 运行模式

### 开发模式

```bash
pnpm install
pnpm db:migrate
pnpm dev:web
pnpm dev:worker
```

### Docker 模式

```bash
docker compose up -d
```

服务：

- `repopulse-web`: Web UI
- `repopulse-worker`: 定时同步 worker
- `repopulse-db`: MySQL service
- `mysql_data`: MySQL volume

## 进程设计

不要依赖 Next.js 的 serverless 定时器。开源自托管场景里，定时任务用单独 worker 更可靠。

Worker 做这些事：

- 启动时读取设置
- 注册 cron
- 每天运行同步
- 手动同步时由 API 写入队列表或直接触发
- 写入 sync_runs / sync_run_items
- 生成 reports
- 触发 alerts

## API 设计原则

- API 返回统一结构
- 前端不要直接读数据库
- 所有敏感操作需要管理员登录
- 所有请求都要 Zod 校验
- 所有错误要有清晰 message 和 code

统一响应建议：

```ts
type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } }
```

## 权限模型

MVP 单用户：admin。

- 未登录只能进入 login 页面
- Setup 页面需要登录
- API 需要 session
- 不做复杂 RBAC

后期可以扩展 Workspace / User / Role。

## 数据流

### Setup

1. 用户输入 GitHub Token
2. 后端验证 Token
3. 后端拉取仓库列表
4. 用户选择仓库
5. 保存加密 Token 和 tracked repositories
6. 用户点击 Start Tracking
7. 触发第一次同步

### Daily Sync

1. Worker 创建 sync_run
2. 读取 tracked repositories
3. 对每个 repo 调用采集器
4. 写 repo snapshot
5. 写 traffic daily
6. 写 releases/assets/snapshots
7. 计算派生指标
8. 生成每日活动事件
9. 生成报告
10. 更新 sync_run 状态

## 错误处理原则

- 单仓库失败不影响其他仓库
- GitHub 403/404/401 要分类处理
- rate limit 不足时停止后续同步并记录
- API 超时要重试，最多 2-3 次
- 每个 sync_run_item 都记录失败原因
- UI 要显示可操作建议，如 Token 权限不足、仓库无权限、rate limit 用尽

## 性能原则

- 仓库列表分页
- Release assets 分页
- 数据库写入使用 transaction
- 大量仓库时限制并发，比如 3-5 个 repo 并发
- 图表查询按时间范围聚合，不一次拉全量

## 开源维护原则

- `.env.example` 必须完整
- 默认不启用 AI
- 默认不开启外部通知
- 默认数据只存本机
- README 要明确 GitHub Token 权限
- Issue 模板包含 bug report / feature request
- 提供 screenshots 目录或 docs 图片占位
