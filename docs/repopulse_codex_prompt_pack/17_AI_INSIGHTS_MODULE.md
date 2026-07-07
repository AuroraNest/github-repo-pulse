# 17 - AI Insights 模块

## 模块定位

AI 是 RepoPulse 的增强模块，不是核心依赖。

它的作用：

- 把数字变成自然语言总结
- 解释异常
- 给出增长建议
- 生成更好看的日报/周报
- 后续支持用户问答

## 设计原则

1. 默认关闭
2. 没有 AI key 时系统正常运行
3. AI 失败不影响同步
4. 不把 GitHub Token、API Key、私有代码内容发给 AI
5. 只发送聚合指标
6. 支持 OpenAI-compatible endpoint
7. 支持本地 Ollama
8. 可在 UI 里测试连接

## 配置

```env
AI_ENABLED=false
AI_PROVIDER=openai-compatible
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=
AI_MODEL=gpt-4o-mini
AI_TIMEOUT_MS=30000
```

Provider 枚举：

```text
openai-compatible
openrouter
ollama
none
```

## 文件结构

```text
packages/core/src/ai/
  provider.ts
  prompts.ts
  summarize-report.ts
  explain-anomaly.ts
  suggest-actions.ts
  types.ts
```

## Provider interface

```ts
export type AiMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type AiCompletionOptions = {
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface AiProvider {
  complete(messages: AiMessage[], options?: AiCompletionOptions): Promise<string>
}
```

## AI 用途 1：每日报告总结

输入：结构化聚合数据。

```ts
type DailyReportAiInput = {
  date: string
  overview: {
    totalStars: number
    starDelta: number
    totalForks: number
    forkDelta: number
    totalDownloads: number
    downloadDelta: number
    visitors14d: number
    clones14d: number
  }
  topRepositories: Array<{
    fullName: string
    metric: string
    value: number
    delta: number
    deltaPercent?: number
  }>
  topAssets: Array<{
    repository: string
    name: string
    downloads: number
    dailyDelta: number
  }>
  anomalies: Array<{
    type: string
    repository?: string
    message: string
    severity: string
  }>
}
```

输出：

```ts
type DailyReportAiOutput = {
  executiveSummary: string
  highlights: string[]
  anomaliesExplanation: string[]
  suggestedActions: string[]
}
```

## System prompt

```text
You are RepoPulse, an analytics assistant for GitHub repository maintainers.
Summarize repository metrics clearly and practically.
Use concise language.
Do not invent numbers.
Only use the provided data.
If data is insufficient, say so.
Focus on actionable insights for open-source maintainers.
Never mention secrets, tokens, or private repository contents.
```

中文项目可以输出中文。Settings 里可以配置 report language。

## AI 用途 2：异常解释

输入：

- metric
- today value
- 7-day average
- percent change
- related referrers
- related popular paths

输出：

- likely explanation
- confidence: low/medium/high
- suggested action

## AI 用途 3：增长建议

根据数据给建议：

- README 优化
- Release notes 优化
- 增加截图
- 固定下载链接
- 加 badge
- 发社交平台
- 检查下载下降

## AI 用途 4：自然语言问答，后续阶段

页面：`/insights` 或 Overview 中的 AI panel。

用户可以问：

- 哪个仓库今天表现最好？
- 哪个 Release 下载增长最快？
- 我应该优先维护哪个项目？
- 哪个仓库没有访问了？

MVP 不必做完整聊天，可以先做日报 AI。

## Fallback 规则总结

没有 AI 时，使用规则生成：

```text
Today, total downloads increased by X. The fastest growing repository was Y. The most downloaded asset was Z. There were N anomalies.
```

中文：

```text
今天总下载量新增 X 次。增长最快的仓库是 Y。下载最多的资源是 Z。检测到 N 个异常。
```

## UI 展示

在 Reports 页面：

- AI badge：AI Enhanced
- 如果未启用：Rules-based summary
- 如果 AI 失败：AI unavailable, using local summary

Settings 页面：

- AI Enabled toggle
- Provider select
- Base URL
- API Key
- Model
- Test connection
- Data sent to AI explanation

## 数据安全

AI 输入必须经过 sanitize：

```ts
sanitizeAiInput(data)
```

删除：

- token
- secret
- raw env
- private source code
- webhook urls

## 验收标准

- AI 未配置时报告正常生成
- AI 配置后报告可增强
- AI 失败时自动 fallback
- AI 输出不编造数字
- UI 能显示 AI 状态
- 不发送敏感字段
