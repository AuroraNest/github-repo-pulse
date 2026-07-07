> 本文是给 Codex 的页面级实现提示词。实现时请同时遵守 `docs/02_master_codex_prompt.md`、`docs/04_design_system.md` 和数据库/API 文档。

# 页面 06：Reports 每日报告页

## 页面目标

把数据转成人能读懂的每日/每周/月度总结。

回答：

> 今天哪些仓库表现最好？有没有异常？我应该做什么？

## 路由

```text
/reports
```

## UI 结构

参考 UI 图 `repopulse报告页面仪表盘截图.png`。

顶部控制：

- Date picker。
- Report frequency：Daily / Weekly / Monthly。
- Export PDF。
- Export Markdown。
- Export CSV。

左侧：Recent Reports。

中间：Report content。

右侧：Delivery Settings / Report Includes。

## Report 内容

报告结构：

```text
Title
Executive Summary
KPI strip
Today’s Highlights
Activity Overview Chart
Anomalies
Fastest Movers
Suggested Actions
Top Assets
Top Repositories
```

## API

```text
GET  /api/reports?period=daily&page=1
GET  /api/reports/:id
POST /api/reports/generate
POST /api/reports/:id/regenerate-ai
GET  /api/reports/:id/export?format=markdown|csv|pdf
```

## 生成逻辑

每天同步完成后自动生成报告：

```text
syncAllTrackedRepositories
→ calculateDailyMetrics
→ generateRuleBasedReport
→ if AI_ENABLED generateAiEnhancedReport
→ save report
→ run alert rules
```

## Rule-based report

必须实现，不依赖 AI。

规则：

- highlight downloads 增长最大的 asset。
- highlight stars 增长最大的 repo。
- highlight traffic 增长最大的 repo。
- anomaly：今日指标 > 7 日均值 * 2。
- anomaly：今日指标 < 7 日均值 * 0.5。
- suggested action 根据异常生成。

## AI report

如果 AI 开启：

- 发送聚合 metrics。
- 获得结构化 JSON。
- 合并到报告中。
- 显示 `AI assisted` badge。

如果 AI 失败：

- fallback 到 rule report。
- 显示 warning 不影响报告。

## Export

Markdown 导出第一版必须有。

Markdown 格式：

```md
# RepoPulse Daily Report - 2026-07-07

## Summary
...

## Highlights
- ...

## Anomalies
- ...

## Suggested Actions
- ...

## Metrics
| Metric | Value | Change |
```

CSV 导出：导出 metrics tables。

PDF 可先用浏览器 print 或后续实现。

## Delivery Settings

第一版可以先只存设置，不实际发邮件。第二阶段实现：

- Email。
- Webhook。
- Telegram。
- Discord。

## Acceptance Criteria

- 每天同步后自动生成一份 daily report。
- 用户可手动生成/重新生成。
- 没有 AI key 也能生成报告。
- Markdown 导出可用。
- Report 页面显示历史报告列表。
