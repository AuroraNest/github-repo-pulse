# 20 - 分阶段给 Codex 的提示词

这个文件是实际使用时最方便的。不要一次让 Codex 做完整项目，建议分阶段推进。

## Phase 0：初始化项目

```text
请初始化 RepoPulse 项目骨架。使用 pnpm workspace，包含 apps/web、apps/worker、packages/db、packages/core。Web 使用 Next.js App Router + TypeScript + Tailwind + shadcn/ui 结构。Worker 使用 Node.js TypeScript。添加 .env.example、docker-compose.yml 占位、README 占位。先不要实现完整业务，但要保证 pnpm install、typecheck、dev 命令结构清晰。请按 02_TECH_STACK_AND_ARCHITECTURE.md 的目录结构实现。
```

验收：项目能启动空页面。

## Phase 1：设计系统和 Layout

```text
请实现 RepoPulse 的全局 UI Layout 和设计系统。包含左侧 Sidebar、顶部 Header、状态 chips、KPI Card、Chart Card、Data Table wrapper、Empty State、Loading Skeleton。UI 风格参考 07_UI_DESIGN_SYSTEM.md，苹果风格理念：简洁、浅色、圆角、柔和阴影、留白。不要复制 Apple 页面。先使用 mock data。实现 /overview、/repositories、/releases、/reports、/settings 的基础页面框架。
```

验收：页面外观已经像产品。

## Phase 2：数据库 schema

```text
请根据 04_DATABASE_SCHEMA.md 实现数据库 schema。当前实现选择 MySQL-first。实现 database client、migration、基础 query helper。表包括 app_settings、github_connections、repositories、repository_snapshots、traffic_daily、traffic_summary_snapshots、popular_path_snapshots、referrer_snapshots、releases、release_assets、release_asset_snapshots、sync_runs、sync_run_items、activity_events、reports、alert_rules、alert_events、ai_settings、ai_runs。注意唯一索引和 snapshot upsert 需要支持。
```

验收：migration 能创建所有表。

## Phase 3：登录、安全和 Token 加密

```text
请实现单用户管理员登录。使用 ADMIN_EMAIL、ADMIN_PASSWORD、SESSION_SECRET。实现 /login 页面、session cookie、API auth middleware。实现 packages/core/src/security/crypto.ts，使用 ENCRYPTION_KEY 对 GitHub Token 和 AI API Key 做 AES-GCM 加密。实现 token mask，确保 API 不返回明文 token。更新 .env.example。
```

验收：未登录不能访问 dashboard，登录后可进入。

## Phase 4：GitHub Token 验证和 Setup 页面

```text
请实现 Setup / Connect GitHub 页面和对应 API。根据 08_PAGE_SETUP_CONNECT_GITHUB.md，实现 token 输入、Verify Token、权限检查、仓库列表获取、选择仓库、同步时间设置、Start Tracking。后端使用 Octokit 调 GitHub API，保存加密 token，保存 tracked repositories，setup_completed=true。没有真实 token 时页面显示友好提示。实现 loading/empty/error 状态。
```

验收：可以填 token、拉仓库、选择仓库。

## Phase 5：GitHub collector 和手动同步

```text
请根据 05_GITHUB_API_COLLECTOR.md 实现 GitHub 采集器。实现 repo metadata、traffic views、traffic clones、popular paths、referrers、releases、assets 的采集和数据库写入。实现 sync_runs 和 sync_run_items。实现 POST /api/sync/run 和 POST /api/repositories/:id/sync。单仓库失败不能影响其他仓库。Traffic 权限失败要记录但不阻断 repo metadata 和 releases。
```

验收：点击手动同步后数据库有快照。

## Phase 6：Worker 定时任务

```text
请实现 apps/worker。读取 app_settings 中的 sync_cron 和 sync_timezone，使用 node-cron 每天执行 syncAllRepositories。支持 SYNC_ENABLED、SYNC_CONCURRENCY、SYNC_RETRY_LIMIT。启动时输出 worker heartbeat。同步结束后生成 activity_events，并尝试生成每日报告。
```

验收：worker 可独立运行，能定时同步。

## Phase 7：Overview 页面真实数据

```text
请把 Overview 页面接入真实 API。根据 09_PAGE_OVERVIEW.md，实现 GET /api/overview，返回 kpis、growth trends、views vs clones、fastest growing repositories、top releases、activity feed。处理 no data、loading、error。所有数字要格式化，图表使用 Recharts。
```

验收：Overview 显示真实同步数据。

## Phase 8：Repositories 和 Repository Detail

```text
请实现 Repositories 仓库列表页和 Repository Detail 页面。根据 10_PAGE_REPOSITORIES.md 和 11_PAGE_REPOSITORY_DETAIL.md，实现表格、筛选、排序、分页、单仓库详情、traffic chart、popular paths、referrers、conversion funnel、release asset 列表、sync now。API 返回真实数据。没有 traffic 权限时给友好提示。
```

验收：可以从列表进入详情，看到完整数据。

## Phase 9：Releases / Downloads 页面

```text
请根据 12_PAGE_RELEASES_DOWNLOADS.md 实现 Releases 页面。重点实现 release asset snapshots、total downloads、today delta、7-day delta、30-day delta、top assets、cumulative downloads chart、daily downloads by repository chart、assets table。第一次同步 delta 不能把历史累计算成今日新增。
```

验收：可以看到每个 APK/zip/dmg 的累计下载和每日新增。

## Phase 10：Reports 页面和规则报告

```text
请根据 13_PAGE_REPORTS.md 实现 Reports 页面和报告生成模块。先用规则生成每日/每周/月度报告，不依赖 AI。报告包含 summary、KPIs、highlights、anomalies、fastest movers、suggested actions、markdown_content。实现 POST /api/reports/generate、GET /api/reports、GET /api/reports/:id、Markdown 导出。
```

验收：能生成并查看日报。

## Phase 11：AI Insights 可选模块

```text
请根据 17_AI_INSIGHTS_MODULE.md 实现可选 AI 模块。支持 AI_ENABLED、AI_PROVIDER、AI_BASE_URL、AI_API_KEY、AI_MODEL。实现 OpenAI-compatible provider。Reports 生成时，如果 AI enabled，则用 AI 改写 summary、highlights、suggestedActions；失败时 fallback 到规则版。Settings 页面支持配置和测试连接。确保不会把 GitHub Token 或敏感字段发给 AI。
```

验收：AI 关掉能运行，AI 开启能增强报告。

## Phase 12：Settings、Activity Logs、Alerts MVP

```text
请实现 Settings 页面真实配置保存，并实现 Activity / Sync Logs 页面基础版。Settings 包含 GitHub connection、token health、sync schedule、retention、database status、AI settings、backup/export、delete data。Activity Logs 显示 sync_runs 和 sync_run_items，支持 retry failed。Alerts 先实现基础规则表和 in-app alert events。
```

验收：可以管理配置和查看同步错误。

## Phase 13：Docker、README、开源发布

```text
请根据 18_DEPLOYMENT_OPEN_SOURCE.md 完成 Dockerfile.web、Dockerfile.worker、docker-compose.yml、.env.example、README、LICENSE、GitHub issue templates、CI workflow。确保 docker compose up -d 后可以访问 Web，worker 能启动，MySQL 数据持久化。
```

验收：新用户按照 README 可以部署成功。

## Phase 14：测试和验收

```text
请根据 19_TESTING_ACCEPTANCE_CHECKLIST.md 添加测试。重点测试 release daily_delta、traffic_daily upsert、report generation、AI fallback、API auth。补齐 loading/empty/error 状态。修复 TypeScript、lint、build 问题。
```

验收：测试通过，build 通过，完整流程可跑通。
