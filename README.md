# RepoPulse

RepoPulse is a self-hosted GitHub analytics dashboard for repository growth, release downloads, traffic, sync history, and rule-based reports.

- Repository: `https://github.com/AuroraNest/github-repo-pulse`
- Production: `https://repopulse.auroramaple.com/overview`
- Branches: `main` is the release branch, `dev` is the development branch.

## English

### What it includes

- `apps/web`: Next.js TypeScript app with Tailwind UI, API routes, runtime English/Chinese switching, and explicit demo-data mode.
- `apps/worker`: Node.js worker skeleton for scheduled and manual sync jobs.
- `packages/core`: shared contracts, mock data, GitHub collector skeleton, metrics, and report helpers.
- `packages/db`: MySQL-first schema, migration, and client helpers.

### Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev:web
```

`GITHUB_TOKEN` may stay empty for local UI smoke testing. By default, missing GitHub configuration shows a clear configuration-required empty state instead of demo repositories, KPIs, releases, or reports.

Set `MOCK_GITHUB=true` only when you explicitly want demo data. Demo mode is labeled in the UI and API payloads report `github.mode: "demo"`.

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

### Docker

```bash
export DOCKER_REGISTRY_USER=your-user
export DOCKER_REGISTRY_PASSWORD=your-password
./push-private-registry-images.sh 0.1.0
```

By default the image is pushed to `docker.auroramaple.com/aurora/github-repo-pulse/web`. Override `PROJECT_SLUG` only when publishing under a different registry path.

## 中文

RepoPulse 是一个自托管 GitHub 数据分析看板, 用于查看仓库增长, release 下载, traffic, 同步历史和规则生成报告.

- 代码仓库: `https://github.com/AuroraNest/github-repo-pulse`
- 线上地址: `https://repopulse.auroramaple.com/overview`
- 分支约定: `main` 是正式分支, `dev` 是开发分支.

### 包含内容

- `apps/web`: Next.js TypeScript 应用, 包含 Tailwind UI, API routes, 运行时语言切换和显式 demo data 模式.
- `apps/worker`: 用于定时和手动同步任务的 Node.js worker 骨架.
- `packages/core`: 共享 contracts, mock data, GitHub collector 骨架, metrics 和 report helpers.
- `packages/db`: MySQL 优先的 schema, migration 和 client helpers.

### 本地启动

```bash
pnpm install
cp .env.example .env.local
pnpm dev:web
```

`GITHUB_TOKEN` 可以在本地 UI smoke 测试时保持为空.默认缺少 GitHub 配置时, RepoPulse 会显示明确的配置必需空态, 不显示 demo 仓库, KPI, release 或 report.

只有明确需要 demo 数据时才设置 `MOCK_GITHUB=true`.Demo mode 会在 UI 中标注, API payload 会返回 `github.mode: "demo"`.

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

### Docker

```bash
export DOCKER_REGISTRY_USER=your-user
export DOCKER_REGISTRY_PASSWORD=your-password
./push-private-registry-images.sh 0.1.0
```

默认镜像推送到 `docker.auroramaple.com/aurora/github-repo-pulse/web`.只有需要发布到不同 registry 路径时才覆盖 `PROJECT_SLUG`.
