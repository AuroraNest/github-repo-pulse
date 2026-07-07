# RepoPulse

RepoPulse is a self-hosted GitHub analytics dashboard for repository growth, release downloads, traffic, sync history, and rule-based reports. The web app supports runtime English and Chinese switching through a small cookie-backed locale layer.

## English

### What it includes

- `apps/web`: Next.js TypeScript app with Tailwind UI, API routes, runtime locale switching, and mock-data fallback.
- `apps/worker`: Node.js worker skeleton for scheduled and manual sync jobs.
- `packages/core`: shared contracts, mock data, GitHub collector skeleton, metrics, and report helpers.
- `packages/db`: MySQL-first schema, migration, and client helpers.

### Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev:web
```

`GITHUB_TOKEN` and `DATABASE_URL` may stay empty or placeholder-only for UI smoke testing. When live GitHub or database configuration is absent, RepoPulse falls back to mock data.

### Runtime language switching

- Supported locales: `en` and `zh`.
- Locale storage: `repopulse_locale` cookie.
- UI behavior: the language switcher updates the cookie and refreshes the current route.
- Scope: shared chrome, setup, overview, repositories, repository detail, releases, reports, settings, common labels, and number/date formatting.
- Data values such as repository names, release asset names, GitHub tags, and mock report body text remain source data.

### Checks

```bash
pnpm check:logic
pnpm typecheck
pnpm --filter @repopulse/web build
```

Run `packages/db/src/migrations/0001_initial.sql` only against a local MySQL database after replacing placeholders with local-only credentials. Do not use real production database configuration in this repo.

## 中文

RepoPulse 是一个自托管 GitHub 数据分析看板, 用于查看仓库增长, release 下载, traffic, 同步历史和规则生成报告.Web app 支持运行时中英文切换, 通过轻量 cookie locale 层实现.

### 包含内容

- `apps/web`: Next.js TypeScript 应用, 包含 Tailwind UI, API routes, 运行时语言切换和 mock data 兜底.
- `apps/worker`: 用于定时和手动同步任务的 Node.js worker 骨架.
- `packages/core`: 共享 contracts, mock data, GitHub collector 骨架, metrics 和 report helpers.
- `packages/db`: MySQL 优先的 schema, migration 和 client helpers.

### 本地启动

```bash
pnpm install
cp .env.example .env.local
pnpm dev:web
```

`GITHUB_TOKEN` 和 `DATABASE_URL` 可以在 UI smoke 测试时保持为空或占位值.缺少 live GitHub 或数据库配置时, RepoPulse 会回退到 mock data.

### 运行时语言切换

- 支持语言: `en` 和 `zh`.
- 存储方式: `repopulse_locale` cookie.
- UI 行为: 语言切换器写入 cookie 并刷新当前 route.
- 覆盖范围: shared chrome, setup, overview, repositories, repository detail, releases, reports, settings, common labels, 以及数字和日期格式.
- 仓库名, release asset 名称, GitHub tag, mock report 正文等保持为原始数据值.

### 检查命令

```bash
pnpm check:logic
pnpm typecheck
pnpm --filter @repopulse/web build
```

只在替换为本地专用凭据后, 才对本地 MySQL 数据库运行 `packages/db/src/migrations/0001_initial.sql`.不要在这个 repo 中写入真实生产数据库配置.
