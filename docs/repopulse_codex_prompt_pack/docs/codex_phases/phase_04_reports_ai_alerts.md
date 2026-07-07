# Phase 04：报告、AI、告警、同步日志

## 给 Codex 的阶段提示词

实现 RepoPulse 的分析增强功能。

必须完成：

1. Rule-based daily report generation。
2. Reports 页面可查看报告。
3. Markdown/CSV 导出。
4. AI optional report summary。
5. AI settings 和 test connection。
6. Activity / Sync Logs 页面。
7. Alert rules MVP。
8. Alert events 在 Overview/Reports 中展示。

## AI 要求

- 默认关闭。
- 没有 AI key 时不影响报告。
- AI 输出用 zod 校验。
- AI 输入不包含 secret。

## 告警要求

默认规则：

- downloads spike。
- sync failed。
- rate limit low。
- new release。

## 验收

- 同步后自动生成报告。
- AI disabled 时也能生成报告。
- AI enabled 且 key 正确时能生成 AI summary。
- Activity 页面能看到 sync run 详情。
- Alert rules 能触发 event。
