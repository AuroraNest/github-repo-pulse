# Backend 05：部署与开源发布

## Docker Compose

MVP 必须支持：

```bash
docker compose up -d
```

示例：

```yaml
services:
  repopulse-web:
    image: ghcr.io/yourname/repopulse:latest
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - ./data:/app/data
    depends_on:
      - repopulse-worker

  repopulse-worker:
    image: ghcr.io/yourname/repopulse:latest
    command: pnpm worker
    env_file:
      - .env
    volumes:
      - ./data:/app/data
```

## .env.example

```env
APP_URL=http://localhost:3000
APP_SECRET=change-me
DATABASE_URL=file:./data/repopulse.db

# Auth
DISABLE_AUTH=true
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=

# GitHub
GITHUB_TOKEN=
GITHUB_API_VERSION=2022-11-28
SYNC_CRON=0 8 * * *
SYNC_TIMEZONE=UTC
SYNC_CONCURRENCY=2

# AI optional
AI_ENABLED=false
AI_PROVIDER=openai
AI_MODEL=
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1

# Notifications optional
WEBHOOK_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

## README 开源文档

README 必须包含：

- 项目简介。
- 截图。
- 功能列表。
- 为什么需要 RepoPulse。
- 快速开始。
- GitHub Token 权限说明。
- AI 可选说明。
- 数据隐私说明。
- Docker 部署。
- 本地开发。
- Roadmap。
- License。

## License

推荐 MIT。

## Roadmap

```text
v0.1 MVP: MySQL + PAT + dashboards + reports
v0.2 AI summaries + alerts + webhooks
v0.3 GitHub App auth + PostgreSQL/SQLite adapter
v0.4 Team mode + hosted option optional
```

## Release Checklist

- [ ] README 完整。
- [ ] .env.example 完整。
- [ ] Docker Compose 可运行。
- [ ] Demo data 可运行。
- [ ] LICENSE。
- [ ] SECURITY.md。
- [ ] CONTRIBUTING.md。
- [ ] Screenshots。
- [ ] CI 通过。
- [ ] GitHub release notes。

## 重要 README 文案

```text
RepoPulse cannot recover GitHub traffic history before installation. It starts preserving your repository history from the first sync.
```

中文：

```text
RepoPulse 无法恢复部署之前的 GitHub Traffic 历史；它会从第一次同步开始保存长期历史。
```
