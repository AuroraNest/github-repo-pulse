# RepoPulse Codex Prompt Pack

这个压缩包是一套给 Codex / AI 编程助手使用的项目实现提示词文档。目标是把我们讨论过的 **RepoPulse** 做成一个可以开源、自托管、每日自动统计 GitHub 仓库数据的产品。

## 项目一句话

RepoPulse 是一个开源、自托管的 GitHub 仓库增长监控与每日报告系统。它每天采集仓库基础数据、Traffic、Clone、Release 下载量、热门页面、来源网站等信息，并长期保存历史趋势，解决 GitHub 原生 Traffic 只保留短期数据、Release 下载量缺少每日增量的问题。

## 建议技术栈

- 前端：Next.js App Router + React + TypeScript
- UI：Tailwind CSS + shadcn/ui + Lucide Icons + Recharts + TanStack Table
- 后端：Next.js Route Handlers + 独立 Worker 进程
- GitHub API：Octokit REST
- 数据库：当前实现选择 MySQL-first，保留 PostgreSQL/SQLite adapter 空间
- ORM/DB：Drizzle ORM、Prisma 或轻量 query helper 均可；业务层必须隔离数据库访问
- 定时任务：独立 worker + node-cron
- AI 模块：可选，支持 OpenAI / OpenRouter / Ollama / 自定义兼容 OpenAI API 的 endpoint
- 部署：Docker Compose 一键启动

## 文件说明

| 文件 | 作用 |
|---|---|
| `00_SINGLE_MASTER_PROMPT.md` | 给 Codex 的总提示词，可以直接丢给 Codex 开始整体实现 |
| `01_PRODUCT_SCOPE.md` | 产品定位、边界、MVP 与后续版本规划 |
| `02_TECH_STACK_AND_ARCHITECTURE.md` | 技术栈、目录结构、服务拆分、运行模式 |
| `03_ENV_SECURITY_AND_AUTH.md` | 环境变量、安全、Token 加密、单用户登录 |
| `04_DATABASE_SCHEMA.md` | 数据库表设计、字段、索引、派生指标 |
| `05_GITHUB_API_COLLECTOR.md` | GitHub API 采集器设计、同步策略、错误处理 |
| `06_API_ROUTES.md` | 后端 API 路由设计和返回结构 |
| `07_UI_DESIGN_SYSTEM.md` | UI 设计系统，参考苹果设计理念，但不复制任何 Apple 产品 |
| `08_PAGE_SETUP_CONNECT_GITHUB.md` | Setup / Connect GitHub 页面实现提示词 |
| `09_PAGE_OVERVIEW.md` | Overview 总览页实现提示词 |
| `10_PAGE_REPOSITORIES.md` | Repositories 仓库列表页实现提示词 |
| `11_PAGE_REPOSITORY_DETAIL.md` | Repository Detail 单仓库详情页实现提示词 |
| `12_PAGE_RELEASES_DOWNLOADS.md` | Releases / Downloads 下载统计页实现提示词 |
| `13_PAGE_REPORTS.md` | Reports 每日报告页实现提示词 |
| `14_PAGE_ACTIVITY_LOGS.md` | Activity / Sync Logs 同步日志页实现提示词 |
| `15_PAGE_ALERTS_AUTOMATION.md` | Alerts / Automation 告警规则页实现提示词 |
| `16_PAGE_SETTINGS_INTEGRATIONS.md` | Settings / Integrations 设置与集成页实现提示词 |
| `17_AI_INSIGHTS_MODULE.md` | AI 总结、AI 洞察、AI 报告模块实现提示词 |
| `18_DEPLOYMENT_OPEN_SOURCE.md` | Docker、README、开源发布、部署文档 |
| `19_TESTING_ACCEPTANCE_CHECKLIST.md` | 测试与验收标准 |
| `20_PHASED_CODEX_PROMPTS.md` | 分阶段交给 Codex 的提示词顺序 |

## 页面列表

MVP 第一版建议实现：

1. Setup / Connect GitHub
2. Overview
3. Repositories
4. Repository Detail
5. Releases / Downloads
6. Reports
7. Settings

第二阶段补充：

8. Traffic 独立页
9. Activity / Sync Logs
10. Alerts / Automation
11. Integrations
12. Data Export / Backup

其中 Traffic、Export、Automation 的部分功能可以先合并到 Repository Detail、Reports、Settings 页面里。

## 给 Codex 的执行建议

优先按下面顺序做：

1. 先搭项目骨架和 UI Layout
2. 再做数据库 schema
3. 再做 GitHub Token 验证与仓库列表获取
4. 再做每日同步 worker
5. 再做 Overview / Repositories / Releases 页面
6. 再做 Reports 和 AI 模块
7. 最后做 Docker Compose、文档、测试

不要一开始就追求多租户、复杂权限、GitHub App Marketplace、移动端 App。这个项目的核心闭环是：

> 部署 → 填 Token → 选择仓库 → 每天自动采集 → 看趋势 → 看报告
