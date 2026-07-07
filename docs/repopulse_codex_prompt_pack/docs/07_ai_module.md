# 07. AI 模块设计

AI 是 RepoPulse 的加分模块，但不是核心依赖。系统必须在 `AI_ENABLED=false` 时完整可用。

## AI 模块目标

AI 主要用于：

1. 生成每日/每周/月度自然语言总结。
2. 解释异常波动。
3. 给出建议动作。
4. 让用户用自然语言询问仓库数据，例如“哪个仓库最近下载增长最快？”

第一版建议只做 1-3，聊天问答作为第二阶段。

## 配置

`.env`：

```env
AI_ENABLED=false
AI_PROVIDER=openai
AI_MODEL=
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
AI_MAX_INPUT_DAYS=30
AI_STORE_PROMPTS=false
```

兼容选项：

```env
AI_PROVIDER=openai | openai-compatible | ollama | none
OPENAI_BASE_URL=...
OLLAMA_BASE_URL=http://localhost:11434
```

不要硬编码模型名称。用户自己填 `AI_MODEL`。

## 数据隐私原则

绝对不要发给 AI：

- GitHub Token。
- OpenAI Key。
- 用户密码。
- 私有仓库源码内容。
- private issue 内容。
- webhook secret。

允许发给 AI：

- 仓库名。
- 公开/非敏感元数据。
- 聚合数值：stars、forks、downloads、views、clones。
- 变化率。
- 已计算异常摘要。
- release asset 文件名。

对于 private repo，提供设置：

```text
[ ] Include private repository names in AI summaries
```

如果关闭，则 private repo 用匿名名：`private-repo-1`。

## AI 输出结构

AI 必须返回 JSON，不要直接返回自由文本。

Schema：

```ts
export const AiReportSchema = z.object({
  executiveSummary: z.string(),
  highlights: z.array(z.object({
    type: z.enum(['stars', 'forks', 'downloads', 'traffic', 'clones', 'release', 'other']),
    title: z.string(),
    detail: z.string(),
    severity: z.enum(['positive', 'neutral', 'warning']).default('neutral'),
    repositoryFullName: z.string().optional(),
  })),
  anomalies: z.array(z.object({
    title: z.string(),
    detail: z.string(),
    metric: z.string(),
    repositoryFullName: z.string().optional(),
    severity: z.enum(['info', 'warning', 'critical']),
  })),
  suggestedActions: z.array(z.object({
    title: z.string(),
    detail: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
  })),
})
```

如果 AI 返回不合法 JSON：

1. 尝试修复一次。
2. 仍失败则 fallback 到规则报告。
3. 在 `ai_generations` 记录失败。

## AI 报告 Prompt 模板

实现 `src/server/reports/aiSummary.ts`。

Prompt：

```text
You are RepoPulse, a concise analytics assistant for open-source maintainers.

Task:
Generate a daily repository analytics summary from structured GitHub metrics.

Rules:
- Return valid JSON only.
- Do not invent numbers.
- Mention only repositories and metrics present in the input.
- Be concise, practical, and friendly.
- Avoid hype.
- Suggested actions must be actionable.
- If data is missing, say it is unavailable instead of guessing.

Output JSON schema:
{...}

Input metrics:
{{metrics_json}}
```

## 规则报告 fallback

没有 AI 时，`ruleBasedSummary.ts` 生成报告：

规则示例：

- 找出 downloadsDelta1d 最大的 asset。
- 找出 starsDelta1d 最大的 repo。
- 找出 viewsDelta7dPercent 最大的 repo。
- 如果某指标 > 7 日均值 * 2，标记为 spike。
- 如果某指标 < 7 日均值 * 0.5，标记为 drop。

输出同样的 `AiReportSchema`，source = `rule`。

## AI 页面/功能入口

第一版不需要单独 AI 页面，可放在 Reports 页面和 Settings 页面：

Reports：

- `Generate with AI` 按钮。
- 报告卡片显示 `AI assisted` badge。
- 如果 AI disabled，显示 `Rule-based summary`。

Settings：

- AI Enabled toggle。
- Provider select。
- API Key input。
- Base URL input。
- Model input。
- Test AI connection。
- Privacy options。

第二阶段可以加 `/ai` 页面：

- Ask your repository data。
- “为什么昨天下载量上涨？”
- “哪个仓库最值得继续维护？”

## OpenAI 调用适配

实现 provider interface：

```ts
export interface AiProvider {
  generateReport(input: ReportMetrics): Promise<AiReport>
}
```

OpenAI provider 使用 Responses API。OpenAI-compatible provider 可以使用 Chat Completions 或 Responses，取决于兼容情况。不要把调用细节散落在业务代码中。

## 成本控制

- 默认 AI off。
- 只发送聚合数据。
- 限制输入天数，默认 30 天。
- 报告生成每天最多自动一次。
- 手动生成需要确认。
- 显示最近一次 AI 调用 tokens/cost 估计（如果 API 返回 usage）。
