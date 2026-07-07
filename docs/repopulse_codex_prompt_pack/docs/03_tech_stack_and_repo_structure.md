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

- **数据库访问隔离**：业务层不直接写 SQL。
- **MySQL-first**：当前实现和本地 dev 环境使用 MySQL。
- **mysql2**：当前 Node.js MySQL 驱动。
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
- 默认使用 Docker volume 保存 MySQL 数据。

## 为什么默认 MySQL

当前实现先选择 MySQL, 因为：

- 用户当前 dev 环境和部署目标已经按 MySQL 落地。
- 适合长期历史快照和云服务器部署。
- Docker Compose 可通过 `mysql` service 一键启动。
- 备份和迁移路径更贴近生产部署。

## PostgreSQL/SQLite 扩展策略

第一版实现 MySQL。代码上必须保持数据库访问隔离：

```text
src/server/db/schema.ts
src/server/db/client.ts
src/server/repositories/*.repo.ts
```

不要在页面/组件里直接写 SQL。所有数据读取通过 repository/service 层完成。这样后续可以加：

```env
DATABASE_URL=mysql://...
```

第二阶段再实现 PostgreSQL/SQLite adapter。

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
