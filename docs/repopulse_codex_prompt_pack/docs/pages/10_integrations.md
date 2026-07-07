> 本文是给 Codex 的页面级实现提示词。实现时请同时遵守 `docs/02_master_codex_prompt.md`、`docs/04_design_system.md` 和数据库/API 文档。

# 页面 10：Integrations 集成页

## 页面目标

配置外部通知和数据集成。

## 路由

```text
/integrations
```

## 集成列表

第一阶段 UI 先展示配置入口，功能可逐步实现：

- Webhook。
- Email SMTP。
- Telegram Bot。
- Discord Webhook。
- Slack Webhook。
- 企业微信 Webhook。
- OpenAI / OpenAI-compatible。
- Ollama。

## UI 结构

- Integration cards grid。
- 每个 card 显示：icon、name、description、status、Configure。
- Configure drawer/modal。
- Test connection button。

## Webhook 集成

字段：

```text
Webhook URL
Secret optional
Events: report.created, alert.triggered, sync.failed, release.spike
Enabled
```

发送 payload：

```json
{
  "event": "report.created",
  "timestamp": "...",
  "data": {}
}
```

签名：

```text
X-RepoPulse-Signature: hmac-sha256
```

## Telegram/Discord/Slack

第一版可先只保存配置和 Test Message，真正报告推送第二阶段接上。

## AI Integration

也可以放在 Settings 的 AI Settings 中。Integrations 页只做快捷入口。

## Acceptance Criteria

- 集成配置可保存。
- Test connection/message 可用或返回明确错误。
- webhook secret 不明文回显。
- 配置 disabled 时不会发送。
