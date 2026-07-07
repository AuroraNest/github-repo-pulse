# 16 - 页面：Settings / Integrations 设置与集成

## 页面作用

管理系统配置、连接、安全、数据、通知、AI。

## 路由

```text
/settings
/integrations
```

MVP 可以先把 integrations 合并到 Settings。

## Settings 页面模块

### GitHub Connection

显示：

- account login
- avatar
- connected status
- connected date
- token mask
- token health
- scopes / permissions summary
- rate limit

操作：

- Reverify token
- Rotate token
- Manage repositories

### Sync Schedule

字段：

- sync enabled
- run time
- timezone
- concurrency
- retry limit
- run now

### Storage Retention

选项：

- 30 days
- 90 days
- 12 months
- Forever

### Database Backend

显示：

- provider: SQLite
- database path
- storage used
- status
- backup button

后续支持 MySQL/Postgres 时显示 connection status。

### Automation & Tracking

开关：

- Private repository access
- Release tracking
- Traffic tracking
- Daily summaries
- AI summaries
- Alerts

### AI Settings

字段：

- AI Enabled
- Provider
- Base URL
- API Key
- Model
- Test connection
- Use AI for daily reports
- Use AI for suggested actions

安全提示：

```text
RepoPulse only sends aggregated metrics to AI providers. Tokens and secrets are never sent.
```

### Notification Channels

MVP：

- In-app notifications
- Webhook URL

第二阶段：

- Email SMTP
- Telegram bot
- Discord webhook
- Slack webhook
- 企业微信 webhook

### Backup & Export

- Export analytics CSV
- Export reports Markdown
- Create database backup
- Import backup 可后续

### Privacy & Data Controls

- Anonymous usage telemetry disabled by default
- Delete all data
- View data processing note

### System Status

显示：

- API rate limit
- Last successful sync
- Worker heartbeat
- Queue health
- Current version

## Integrations 独立页建议

如果后期拆出 `/integrations`，包含：

- GitHub
- AI Providers
- Email
- Webhooks
- Telegram
- Discord
- Slack
- Export destinations

每个 integration card：

- icon
- status
- configured / not configured
- test button
- last used

## API

```text
GET /api/settings
PATCH /api/settings
POST /api/settings/github/reverify
POST /api/settings/github/rotate-token
POST /api/settings/ai/test
POST /api/settings/export
DELETE /api/settings/data
```

## UI 验收标准

- 设置分区清楚
- 危险操作用红色并二次确认
- Token 不展示明文
- AI key 不展示明文
- 保存成功有 toast
- 测试连接有 loading 和结果
- Run now 可触发同步
