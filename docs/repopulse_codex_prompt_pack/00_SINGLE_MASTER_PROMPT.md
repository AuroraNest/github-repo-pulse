# RepoPulse 单文件总提示词

下面这段可以作为给 Codex 的总提示词。建议先让 Codex 读完整个仓库，再按阶段实现。

---

你要实现一个开源自托管项目：**RepoPulse**。

RepoPulse 是一个 GitHub 仓库数据监控和每日报告系统。用户部署后，填写 GitHub Token 或未来接入 GitHub App，选择要监控的仓库。系统每天自动采集 GitHub 仓库数据，包括仓库基础指标、stars、forks、watchers、issues、Traffic views、unique visitors、clones、unique cloners、popular paths、referrers、releases、release assets、asset download_count 等，并保存为长期历史数据。系统提供漂亮的 Web 面板展示趋势、排行、异常和每日报告。

目标是开源出来，用户可以通过 Docker Compose 一键部署。项目要足够干净、专业、易维护，UI 参考苹果设计理念：简洁、克制、留白、圆角、柔和阴影、浅色背景、卡片化、清晰层级、轻量动效。不要使用 Apple logo，也不要复制任何 Apple 现有产品页面。

## 技术栈

使用以下技术栈，除非有强理由不要改：

- Monorepo：pnpm workspace
- Web：Next.js App Router + React + TypeScript
- UI：Tailwind CSS + shadcn/ui + Lucide Icons
- 图表：Recharts
- 表格：TanStack Table
- 数据库：SQLite 默认，抽象 DB 层，后续支持 MySQL/PostgreSQL
- ORM：Drizzle ORM + better-sqlite3 或 libsql
- GitHub API：Octokit REST
- Worker：独立 Node.js TypeScript 进程，使用 node-cron 定时运行采集任务
- AI：可选模块，支持 OpenAI-compatible API、OpenRouter、Ollama，未配置时使用规则生成总结
- 部署：Docker Compose
- 测试：Vitest + Playwright 或最小 API/collector 单测

## 目录结构建议

```text
repopulse/
  apps/
    web/
      app/
      components/
      lib/
      routes or api/
    worker/
      src/
        index.ts
        jobs/
        collectors/
  packages/
    db/
      src/
        schema.ts
        client.ts
        queries/
    core/
      src/
        metrics/
        reports/
        ai/
        github/
        security/
  docs/
  docker-compose.yml
  Dockerfile
  .env.example
  README.md
  LICENSE
```

如果你选择单 app 结构，也要保持模块边界清晰：web、worker、db、core 不要混乱。

## MVP 必须完成的页面

1. Setup / Connect GitHub
2. Overview
3. Repositories
4. Repository Detail
5. Releases / Downloads
6. Reports
7. Settings

## 第一版必须完成的核心功能

- 单用户登录：通过 `ADMIN_PASSWORD` 或首次设置管理员密码实现，不做多租户
- GitHub Token 保存：Token 必须加密保存；不要明文写日志；不要返回给前端
- Token 验证：调用 GitHub `/user` 和 repo list，验证权限
- 仓库选择：用户可以选择全部仓库或指定仓库
- 定时同步：每天指定时间同步，也支持手动同步
- 同步数据：repo 基础数据、traffic views、traffic clones、popular paths、referrers、releases、release assets download_count
- 历史保存：每天生成快照；对 GitHub Traffic 返回的 daily 数据按日期 upsert，避免重复
- Release 下载增量：保存 asset download_count 每日快照，然后用今天累计值 - 昨天累计值计算每日新增
- Dashboard：总览、单仓库详情、Release 下载、报告
- Reports：规则生成每日/每周/月度报告；AI 配置可选，启用后对报告做自然语言总结
- 导出：至少支持 CSV/Markdown 导出报告或数据
- Docker Compose：一键启动 web + worker + SQLite volume
- README：写清楚项目定位、安装、环境变量、安全说明、权限说明、截图占位、路线图

## 数据采集说明

GitHub Traffic 数据只保留短期窗口，所以必须每天采集并保存。采集器需要记录同步时间、成功失败、错误信息、API rate limit。不要因为某一个仓库失败就中断全部任务；要 per-repo 失败隔离。

Release asset 的 `download_count` 是累计值，所以保存每日快照后计算增量。asset 以 GitHub asset id 为主键关联，不要只用文件名。

## AI 模块说明

AI 是可选模块，不是强依赖。用户没有配置 AI key 时，系统必须正常运行，并使用规则生成总结。AI 模块用于：

- 每日报告自然语言总结
- 异常解释
- 增长建议
- README / Release 优化建议
- 用户对仓库数据提问，例如“哪个仓库今天表现最好？”

支持配置：

```env
AI_ENABLED=false
AI_PROVIDER=openai-compatible
AI_BASE_URL=
AI_API_KEY=
AI_MODEL=
```

调用 AI 时必须只传必要的聚合数据，不要传 GitHub Token、secret、private repo 内容。AI 输出要有 fallback；失败不能影响同步任务。

## UI 风格

参考此前生成的 UI 图：RepoPulse 左侧 sidebar、顶部搜索、状态 chip、卡片、圆角、柔和阴影、干净图表。所有页面都要保持一致设计系统。

关键风格：

- 浅色背景：`#F8FAFC` / `#FFFFFF`
- 主色：蓝色系
- 状态色：绿色健康、红色异常、黄色提醒、紫色 AI/分叉
- 卡片：大圆角、轻微阴影、细边框
- 字体：系统 sans-serif
- 图表：干净、轻网格、少颜色、不拥挤
- 响应式：桌面优先，至少支持平板宽度

## 验收标准

当项目完成 MVP 后，用户应该可以：

1. `docker compose up -d` 启动
2. 打开 Web 页面
3. 设置管理员密码或使用 env 登录
4. 填 GitHub Token
5. 验证 Token
6. 选择仓库
7. 手动运行一次同步
8. 在 Overview 看见总览数据
9. 在 Repositories 看见仓库列表
10. 在单仓库详情看到 Traffic 和 Release 数据
11. 在 Releases 页面看到 asset 下载统计与每日新增
12. 在 Reports 页面生成一份报告
13. 在 Settings 看到 token 状态、同步时间、数据库状态
14. AI 没配置也能正常用；AI 配置后可以生成更自然的总结

## 代码质量要求

- TypeScript 严格模式
- 明确的错误处理和日志
- 不要硬编码 token、用户名、仓库名
- 所有 env 写入 `.env.example`
- 数据库 migration 可重复执行
- 页面要有 loading / empty / error 状态
- 后端 API 返回统一结构
- 避免在客户端暴露敏感信息
- 写基础单元测试和最小 e2e
- README 面向开源用户，不要只写给作者自己

请按阶段实现：先 scaffold，再数据库，再 collector，再 API，再 UI，再 Reports，再 AI，再 Docker 和文档。每个阶段完成后保持项目可运行。
