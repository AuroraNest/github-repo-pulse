> 本文是给 Codex 的页面级实现提示词。实现时请同时遵守 `docs/02_master_codex_prompt.md`、`docs/04_design_system.md` 和数据库/API 文档。

# 页面 09：Alerts / Automation 告警规则页

## 页面目标

让用户配置自动提醒和自动化规则。

## 路由

```text
/alerts
```

## 第一版可做轻量版本

先支持规则配置和 in-app alert events，不一定马上接邮件/Telegram。

## 规则类型

```text
downloads spike
stars spike
forks spike
views spike
clones spike
new release published
sync failed
rate limit low
repository inactive
```

## 条件类型

```text
absolute greater than
absolute less than
percent increase vs yesterday
percent increase vs 7-day average
percent decrease vs 7-day average
consecutive failures
```

## UI 结构

- Rules list。
- Create rule button。
- Rule editor drawer/modal。
- Recent alert events。

Rules table：

```text
Rule Name
Metric
Scope
Condition
Channels
Status
Last Triggered
Actions
```

Rule editor：

```text
Name
Metric
Scope: all repos / selected repo / selected asset
Condition
Threshold
Cooldown
Channels
Enabled
```

## API

```text
GET /api/alerts/rules
POST /api/alerts/rules
PATCH /api/alerts/rules/:id
DELETE /api/alerts/rules/:id
GET /api/alerts/events
POST /api/alerts/events/:id/acknowledge
```

## 规则执行

同步完成后运行：

```ts
runAlertRules({ date })
```

防骚扰：

- 支持 cooldown，比如 24h 内同规则同仓库只触发一次。
- 支持 enabled/disabled。

## Suggested default rules

初次 setup 后默认创建但不强制启用：

```text
Downloads spike by 100% vs 7-day average
Sync failed 3 times consecutively
Rate limit remaining below 10%
New release published
```

## Acceptance Criteria

- 用户能创建/编辑/删除规则。
- 同步后能生成 alert events。
- 规则不会重复刷屏。
- 告警事件能在 Overview/Reports 中被引用。
