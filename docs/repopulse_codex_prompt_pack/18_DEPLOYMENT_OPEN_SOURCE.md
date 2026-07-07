# 18 - 部署、开源与文档

## 开源目标

RepoPulse 最终要给别人部署，所以项目文档和部署体验必须非常好。

目标：

```bash
git clone https://github.com/yourname/repopulse
cd repopulse
cp .env.example .env
docker compose up -d
```

打开：

```text
http://localhost:3000
```

## Docker Compose

建议：

```yaml
services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_DATABASE: ${MYSQL_DATABASE:-repopulse_dev}
      MYSQL_USER: ${MYSQL_USER:-repopulse_user}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-change-me-locally}
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-change-root-locally}
    volumes:
      - mysql_data:/var/lib/mysql

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - mysql

  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    env_file:
      - .env
    depends_on:
      - mysql

volumes:
  mysql_data:
```

MySQL 数据库存储在 `mysql_data` Docker volume。

## Dockerfile 要求

- 使用 node alpine 或 debian slim
- pnpm install
- build web
- run migrations
- 启动 web 或 worker

可以用 entrypoint：

```bash
pnpm db:migrate && pnpm start
```

## README 结构

README 必须包含：

1. 项目标题和一句话介绍
2. 截图
3. 为什么需要 RepoPulse
4. 功能列表
5. 快速开始
6. GitHub Token 权限说明
7. Docker Compose 部署
8. 环境变量
9. AI 模块说明
10. 数据安全说明
11. Roadmap
12. Contributing
13. License

## README 卖点文案

```md
# RepoPulse

Open-source, self-hosted GitHub repository analytics and daily reporting.

GitHub only shows short-term traffic. RepoPulse stores your repository metrics forever and turns them into daily growth reports.
```

中文可以写：

```md
RepoPulse 是一个开源、自托管的 GitHub 仓库增长监控与每日报告系统。
它每天采集 stars、forks、traffic、clones、release 下载量等数据，并保存长期历史趋势。
```

## Screenshots

放置：

```text
docs/screenshots/overview.png
docs/screenshots/repositories.png
docs/screenshots/releases.png
docs/screenshots/reports.png
```

现在可以先放占位图，后面用你生成的 UI 图替换。

## License

建议 MIT。

```text
MIT License
```

## GitHub Issue Templates

`.github/ISSUE_TEMPLATE/bug_report.yml`

字段：

- version
- deployment method
- database provider
- logs
- expected behavior
- actual behavior

`.github/ISSUE_TEMPLATE/feature_request.yml`

字段：

- problem
- proposed solution
- alternatives

## GitHub Actions

CI：

- install
- typecheck
- lint
- test
- build

Release：

- docker image build 可后续

## 版本规划

### v0.1.0

- MySQL
- GitHub Token
- Daily sync
- Overview
- Repositories
- Releases
- Reports
- Settings
- Docker Compose

### v0.2.0

- AI report enhancement
- Alerts
- Activity logs
- Webhook

### v0.3.0

- GitHub App
- PostgreSQL/MySQL
- Integrations
- Public dashboard

## 数据安全文档

README 必须明确：

- Token 加密存储
- 默认不启用 AI
- AI 只发送聚合指标
- 默认不上传匿名 telemetry
- 所有数据存储在用户自己的服务器

## 开源验收标准

- 新用户按照 README 能跑起来
- `.env.example` 完整
- Docker Compose 可用
- 没有硬编码作者 token/仓库
- License 存在
- README 有截图和说明
- 项目名、描述、关键词适合 GitHub 搜索
