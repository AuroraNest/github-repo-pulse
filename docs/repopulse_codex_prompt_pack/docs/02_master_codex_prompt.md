# 02. Codex 总提示词

下面这段可以作为 Codex 的项目总提示词。建议在新项目开始时整段粘贴。

---

你是一个资深全栈工程师。请实现一个开源、自托管的 GitHub 仓库数据监控面板，项目名为 **RepoPulse**。

## 项目目标

RepoPulse 用于每天自动采集 GitHub 仓库数据，并保存长期历史。GitHub 原生 Traffic 数据只有短期窗口，所以本项目的价值是：定时采集、长期保存、趋势分析、报告生成。

第一版必须支持：

1. 连接 GitHub Personal Access Token。
2. 验证 token 权限。
3. 列出用户可访问仓库。
4. 选择要监控的仓库。
5. 每天自动采集仓库基础数据、traffic 数据、release/download 数据。
6. 保存到本地数据库。
7. 展示总览仪表盘。
8. 展示仓库列表和单仓库详情。
9. 展示 Releases / Downloads 统计。
10. 生成每日/每周/月度报告。
11. 支持可选 AI 总结；没有 AI key 时使用规则生成报告。
12. 支持 Docker Compose 自托管部署。

## 技术栈要求

使用以下技术栈：

- Next.js App Router + TypeScript。
- Tailwind CSS + shadcn/ui + Radix UI 风格组件。
- lucide-react 图标。
- Recharts 图表。
- TanStack Table 表格。
- Drizzle ORM。
- 默认 MySQL 数据库。
- 代码结构预留 PostgreSQL/SQLite adapter 扩展空间。
- Octokit 调用 GitHub REST API。
- 独立 worker 进程负责定时同步。
- Docker Compose 启动 web + worker。

## 数据库要求

默认使用 MySQL，连接串可配置：

```env
DATABASE_URL=mysql://repopulse_user:replace-with-local-password@127.0.0.1:3306/repopulse_dev
```

必须有数据迁移脚本。不要把 token 明文保存到数据库。GitHub Token 和 AI API Key 必须加密保存或只通过环境变量读取。加密需要使用 `APP_SECRET`。

核心表包括：

- settings
- github_connections
- repositories
- repository_snapshots
- traffic_daily
- traffic_paths
- traffic_referrers
- releases
- release_assets
- release_asset_snapshots
- sync_runs
- sync_run_items
- reports
- ai_generations
- alert_rules
- alert_events

## UI 要求

UI 参考 Apple 设计理念：干净、克制、高级、留白充足、圆角、柔和阴影、清晰层级、浅色背景、精致图表。不要直接复制 Apple 任何产品页面，不要使用 Apple Logo。

页面至少包括：

1. Setup / Connect GitHub
2. Overview
3. Repositories
4. Repository Detail
5. Releases / Downloads
6. Reports
7. Settings

第二阶段页面：

8. Activity / Sync Logs
9. Alerts / Automation
10. Integrations

## 采集要求

对每个被监控仓库每天采集：

- repo metadata：stars、forks、watchers/subscribers、open issues、language、topics、license、size、default_branch、pushed_at、created_at、updated_at。
- traffic views：最近 14 天 views / unique visitors。
- traffic clones：最近 14 天 clones / unique cloners。
- popular paths：最近 14 天热门路径。
- popular referrers：最近 14 天来源网站。
- releases：release metadata。
- release assets：asset name、size、content_type、download_count。

Release asset 的 `download_count` 是累计值。必须通过每日快照计算 daily delta。

## AI 模块要求

AI 是可选模块：

- 默认 `AI_ENABLED=false`。
- 支持 `AI_PROVIDER=openai | openai-compatible | ollama | none`。
- 不要把 GitHub Token、用户密钥传给 AI。
- AI 输入只包含仓库名、公开指标、聚合趋势、异常摘要。
- AI 输出必须是结构化 JSON，包含 summary、highlights、anomalies、suggestedActions。
- 没有 AI 时，使用规则模板生成报告。

## 工程质量要求

- 所有页面必须有 loading / empty / error 状态。
- API 必须有输入校验和错误处理。
- 同步任务必须记录 sync run 和每个仓库的 sync item。
- 处理 GitHub API rate limit。
- 不要在日志打印密钥。
- 所有数据采集函数要可单元测试。
- 提供 seed/demo 数据，方便没 token 的开发者预览 UI。
- 提供 README、LICENSE、CONTRIBUTING、SECURITY、.env.example。
- Docker Compose 一键启动。

## 输出方式

请分阶段实现，不要一次性糊完。每个阶段完成后保证项目可运行、可构建、可测试。

阶段建议：

1. Bootstrap 项目、UI 基础、数据库基础。
2. GitHub Token 验证、仓库发现、数据采集、快照存储。
3. 实现核心页面：Setup、Overview、Repositories、Repository Detail、Releases、Reports、Settings。
4. 实现报告生成、AI 可选模块、告警规则、同步日志。
5. 开源发布打磨：Docker、README、测试、文档、demo 数据、安全说明。

请开始实现。
