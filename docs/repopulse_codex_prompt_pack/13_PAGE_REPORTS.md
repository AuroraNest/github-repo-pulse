# 13 - 页面：Reports 每日报告页

## 页面作用

自动生成每日/每周/月度报告。

这是产品的灵魂页：不只是展示数字，而是告诉用户发生了什么。

## 路由

```text
/reports
```

## 顶部控件

- Date picker
- Report frequency: Daily / Weekly / Monthly
- Export PDF
- Export Markdown
- Export CSV
- Regenerate report
- Use AI toggle 或 AI badge

PDF 可以第二阶段实现。MVP 至少支持 Markdown 和 JSON/CSV。

## 左侧 Recent Reports

列表：

- May 20, 2025 Daily Summary
- May 19, 2025 Daily Summary
- ...

显示 generated time 和状态。

## 主报告卡片

报告标题：

```text
Tuesday, May 20, 2025
```

摘要：

```text
Overall repository activity increased today. Modify_Positioning gained momentum with a 15.6% jump in downloads, toolbox received 89 new stars, and total 14-day visitors grew 9.1% compared to yesterday.
```

## 报告内容模块

### KPI Summary

- Total Downloads
- Total Stars
- Total Forks
- 14-Day Visitors

### Today’s Highlights

项目：

- Modify_Positioning downloads increased by 15.6%
- toolbox gained 89 stars
- total forks grew 6.3%
- 14-day visitors reached 24.68k

### Activity Overview Chart

折线图：downloads / stars / forks。

### Anomalies

异常：

- 某个 asset 下载下降
- 某个仓库 clone 突增
- 某个仓库 traffic 权限失效

### Fastest Movers

排行：

- repo
- metric
- growth
- value

### Suggested Actions

规则生成建议：

- README 优化
- Release 描述优化
- 检查下载下降
- 推广增长快的仓库

AI 开启后，用 AI 改写这些建议。

## 右侧 Delivery Settings

MVP 可做静态或基础保存：

- Email / Webhook tabs
- recipients
- schedule
- include executive summary

第二阶段实现真实发送。

## Report Includes

复选项：

- Repository overview
- Top repositories
- Activity trends
- Anomalies
- Release activity
- Detailed metrics
- AI insights

## 报告生成逻辑

文件：

```text
packages/core/src/reports/daily-report.ts
```

输入：

- period_start
- period_end
- overview metrics
- repo deltas
- asset deltas
- traffic changes
- anomalies

输出：

```ts
type ReportData = {
  summary: string
  kpis: ReportKpi[]
  highlights: string[]
  anomalies: Anomaly[]
  fastestMovers: Mover[]
  suggestedActions: string[]
  markdown: string
}
```

## AI 处理

如果 AI 开启：

1. 规则生成结构化 report data
2. 传给 AI 做自然语言总结和建议
3. AI 失败则使用规则版
4. 保存 `ai_generated=true/false`

## Markdown 导出格式

```md
# RepoPulse Daily Report - 2026-07-07

## Summary
...

## Key Metrics
| Metric | Value | Change |

## Highlights
- ...

## Anomalies
- ...

## Top Repositories
| Repository | Metric | Change |

## Release Downloads
| Asset | Downloads | Today |

## Suggested Actions
- ...
```

## API

```text
GET /api/reports
GET /api/reports/:id
POST /api/reports/generate
GET /api/reports/:id/export?format=markdown
```

## 验收标准

- 能生成日报
- 没有 AI 也能生成
- 有 AI 时输出更自然
- 能导出 Markdown
- 报告里数字和 Dashboard 一致
- 报告失败不会影响同步
