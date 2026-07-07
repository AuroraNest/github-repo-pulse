> 本文是给 Codex 的页面级实现提示词。实现时请同时遵守 `docs/02_master_codex_prompt.md`、`docs/04_design_system.md` 和数据库/API 文档。

# 页面 07：Settings 设置页

## 页面目标

管理连接、安全、同步、数据保留、AI、通知、导出等系统配置。

## 路由

```text
/settings
```

## UI 结构

参考 UI 图 `清爽现代的saas仪表盘界面.png`。

设置卡片：

1. GitHub Connection。
2. Token Health。
3. Sync Schedule。
4. Storage Retention。
5. Database Backend。
6. Notification Channels。
7. Automation & Tracking。
8. AI Settings。
9. Privacy & Data Controls。
10. Backup & Export。
11. System Status。

## GitHub Connection

显示：

- Connected login。
- Connected date。
- Token status。
- Rate limit。
- Scopes。

操作：

- Regenerate token。
- Test connection。
- Disconnect。

## Sync Schedule

字段：

- Run time。
- Timezone。
- Next run。
- Run now。
- Sync concurrency。

## Storage Retention

选项：

- 90 days。
- 12 months。
- Forever。

注意：retention job 只删除历史 snapshots 和 logs，不删除 repositories 主表。

## Database Backend

显示：

- Provider：SQLite。
- DB path。
- DB size。
- Last backup。
- Health。

后续支持：MySQL/PostgreSQL。

## AI Settings

字段：

- AI Enabled。
- Provider。
- Base URL。
- Model。
- API Key。
- Test AI。
- Include private repo names toggle。

API key 不返回给前端，只显示 saved/unsaved 状态。

## Notification Channels

第一版配置项：

- Email notifications toggle。
- Webhook alerts toggle。
- In-app notifications toggle。

实际发送第二阶段做。

## Backup & Export

功能：

- Export Analytics Data CSV。
- Export Activity Logs CSV。
- Create Backup。
- Restore Backup optional。

## Privacy & Data Controls

功能：

- Delete all data。
- Export all data。
- Disable anonymous telemetry。

默认不要开启匿名 telemetry。

## System Status

显示：

- API rate limit。
- Last successful sync。
- Queue health。
- Current version。
- Database status。

## Acceptance Criteria

- 设置保存后立即生效或显示需要重启。
- 敏感字段不明文回显。
- Run now 可以触发同步。
- Export CSV 可下载。
- Delete all data 必须二次确认。
