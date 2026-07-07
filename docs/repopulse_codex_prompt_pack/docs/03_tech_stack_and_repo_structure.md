# 03. 技术栈与目录结构

## 推荐技术栈

### 前端/全栈

- **Next.js App Router + TypeScript**：一个项目同时承载页面和 API。
- **Tailwind CSS**：快速实现干净 UI。
- **shadcn/ui + Radix UI**：高质量组件基础。
- **lucide-react**：统一图标风格。
- **Recharts**：折线图、柱状图、面积图、漏斗图可视化。
- **TanStack Table**：仓库列表、Release Assets 表格。
- **date-fns**：日期处理。
- **zod**：表单和 API 输入校验。
- **react-hook-form**：表单处理。

### 后端/数据

- **Drizzle ORM**：轻量、类型安全、SQL 透明。
- **SQLite 默认**：适合自托管个人项目，一键启动。
- **better-sqlite3**：本地 SQLite 驱动。
- **Octokit**：GitHub REST API。
- **node-cron**：worker 进程内定时任务。
- **pino**：结构化日志。

### AI 模块

- 默认关闭。
- 支持 OpenAI Responses API。
- 支持 OpenAI-compatible base URL。
- 预留 Ollama/local model 接口。

### 部署

- Dockerfile。
- docker-compose.yml。
- web 服务 + worker 服务。
- 默认挂载 `./data` 保存 SQLite 和导出文件。

## 为什么默认 SQLite

RepoPulse 第一批用户大概率是个人开发者。SQLite 最适合：

- 不需要单独数据库服务。
- Docker Compose 简单。
- 数据在一个文件里，备份容易。
- 对每天同步一次的写入量完全足够。

## MySQL/PostgreSQL 扩展策略

第一版实现 SQLite。代码上必须保持数据库访问隔离：

```text
src/server/db/schema.ts
src/server/db/client.ts
src/server/repositories/*.repo.ts
```

不要在页面/组件里直接写 SQL。所有数据读取通过 repository/service 层完成。这样后续可以加：

```env
DB_PROVIDER=sqlite | mysql | postgres
DATABASE_URL=...
```

第二阶段再实现 MySQL/PostgreSQL adapter。

## 推荐目录结构

```text
repopulse/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── overview/page.tsx
│   │   ├── repositories/page.tsx
│   │   ├── repositories/[owner]/[repo]/page.tsx
│   │   ├── releases/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── activity/page.tsx
│   │   ├── alerts/page.tsx
│   │   └── integrations/page.tsx
│   ├── setup/page.tsx
│   ├── api/
│   │   ├── setup/
│   │   ├── github/
│   │   ├── repositories/
│   │   ├── dashboard/
│   │   ├── releases/
│   │   ├── reports/
│   │   ├── jobs/
│   │   └── ai/
│   └── globals.css
├── components/
│   ├── layout/
│   ├── charts/
│   ├── cards/
│   ├── tables/
│   ├── forms/
│   └── ui/
├── src/
│   ├── server/
│   │   ├── db/
│   │   │   ├── client.ts
│   │   │   ├── schema.ts
│   │   │   └── migrations/
│   │   ├── github/
│   │   │   ├── client.ts
│   │   │   ├── collectRepo.ts
│   │   │   ├── collectTraffic.ts
│   │   │   └── collectReleases.ts
│   │   ├── jobs/
│   │   │   ├── scheduler.ts
│   │   │   ├── syncAllRepos.ts
│   │   │   └── syncOneRepo.ts
│   │   ├── reports/
│   │   │   ├── generateDailyReport.ts
│   │   │   ├── ruleBasedSummary.ts
│   │   │   └── aiSummary.ts
│   │   ├── alerts/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── security/
│   ├── shared/
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── formatters.ts
│   └── worker.ts
├── scripts/
│   ├── seed.ts
│   ├── migrate.ts
│   └── demo-data.ts
├── docs/
├── public/
├── data/
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── README.md
├── LICENSE
├── SECURITY.md
└── CONTRIBUTING.md
```

## 页面路径建议

```text
/setup
/overview
/repositories
/repositories/[owner]/[repo]
/releases
/reports
/settings
/activity
/alerts
/integrations
```

默认访问 `/`：

- 如果未完成 setup，跳转 `/setup`。
- 如果已完成 setup，跳转 `/overview`。

## UI 组件建议

基础组件：

- `AppShell`
- `Sidebar`
- `TopBar`
- `MetricCard`
- `Sparkline`
- `TrendChart`
- `RepoAvatar`
- `StatusBadge`
- `RepositoryTable`
- `ReleaseAssetTable`
- `EmptyState`
- `ErrorState`
- `LoadingSkeleton`
- `DateRangeSelector`
- `ReportCard`

## 代码风格

- 全部 TypeScript strict。
- 服务端逻辑不要放到 React 组件里。
- `app/api/*` 只做 request parsing、auth、调用 service、返回 JSON。
- 数据采集函数必须幂等：同一天重复采集不会重复插入脏数据。
- 使用 upsert + unique constraints。
- 所有时间统一存 UTC。
