# 03 - 环境变量、安全与登录

## 安全目标

RepoPulse 是自托管工具，但它会接触 GitHub Token、private repo 元数据、流量数据、release 数据。因此安全设计要从第一版就做好。

目标：

- 不明文存储 GitHub Token
- 不在日志中打印 Token
- 不把 Token 传回前端
- 不把用户数据上传到第三方
- AI 模块可关闭，并且不发送敏感 secret
- 默认单用户登录保护
- Docker 部署时有明确 env 配置

## 环境变量建议

`.env.example`：

```env
# App
APP_URL=http://localhost:3000
NODE_ENV=production
PORT=3000

# Auth
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me_now
SESSION_SECRET=replace_with_random_32_chars

# Encryption
# 32 bytes base64 or hex; used to encrypt GitHub token in DB
ENCRYPTION_KEY=replace_with_secure_random_key

# Database
# MySQL-first implementation
DATABASE_URL=mysql://repopulse_user:replace-with-local-password@mysql:3306/repopulse_dev

# Worker
SYNC_ENABLED=true
SYNC_CRON=0 8 * * *
SYNC_TIMEZONE=UTC
SYNC_CONCURRENCY=3
SYNC_RETRY_LIMIT=2

# GitHub
GITHUB_API_BASE_URL=https://api.github.com
GITHUB_TOKEN_MIN_SCOPES=repo,read:user

# AI, optional
AI_ENABLED=false
AI_PROVIDER=openai-compatible
AI_BASE_URL=
AI_API_KEY=
AI_MODEL=
AI_TIMEOUT_MS=30000

# Notification, optional
EMAIL_ENABLED=false
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

WEBHOOK_ENABLED=false
DEFAULT_WEBHOOK_URL=

# Privacy
ALLOW_ANONYMOUS_TELEMETRY=false
```

## 登录设计

MVP 做单用户登录。

方式：

- 默认读取 `ADMIN_EMAIL` + `ADMIN_PASSWORD`
- 登录成功后签发 httpOnly session cookie
- session 使用 `SESSION_SECRET` 签名
- 所有 `/api/*` 敏感接口都需要 session
- 所有页面除 `/login` 外都需要 session

可以先不做注册、多用户、OAuth。

## GitHub Token 保存

Token 保存流程：

1. 前端提交 token 到后端
2. 后端调用 GitHub API 验证
3. 后端用 AES-256-GCM 加密 token
4. 加密结果写 DB：`encrypted_token`, `iv`, `auth_tag`
5. 后端永远不向前端返回明文 token
6. UI 只显示 token masked，例如 `github_pat_****abcd`

加密工具放在：

```text
packages/core/src/security/crypto.ts
```

提供函数：

```ts
encryptSecret(plainText: string): EncryptedPayload
decryptSecret(payload: EncryptedPayload): string
maskToken(token: string): string
```

## Token 权限建议

MVP 支持 Personal Access Token。

用户要统计 public repo：

- public repo metadata
- traffic 相关权限

用户要统计 private repo：

- private repo read access
- repo metadata
- administration read 或相关 traffic 权限

UI 不要强制写死权限名字，因为 GitHub fine-grained token 的权限表达可能变化。页面要写成：

- Read repository metadata
- Read repository traffic
- Read releases
- Read private repositories if selected

验证时如果 traffic API 返回 403，要给清楚提示：

> Token 可以读取仓库，但没有读取 Traffic 的权限。请给该仓库开启 Administration read 或对应权限。

## 日志脱敏

禁止日志出现：

- GitHub Token
- AI API Key
- Session secret
- SMTP password
- Webhook secret

实现 `redact()`：

```ts
redact(value: string): string
```

日志库配置 redaction paths。

## AI 安全

AI 模块只允许传：

- 聚合后的指标
- 仓库名
- public metadata
- 趋势数字
- 规则检测出的异常

不要传：

- GitHub Token
- API Key
- private repo 文件内容
- issue 私密内容
- commit diff
- 用户环境变量

AI 每次调用保存：

- provider
- model
- created_at
- token usage 如果有
- 成功/失败状态

不保存完整敏感 prompt；可以保存摘要或 hash。

## 数据删除

Settings 提供 Delete all data。

删除内容：

- GitHub connection
- repositories
- snapshots
- sync logs
- reports
- alerts
- AI logs

删除前要求二次确认：输入 `DELETE`。

## 备份导出

导出内容：

- CSV 指标
- JSON 配置，不包含明文 token
- Markdown 报告

不要把 encrypted token 直接导出到默认备份里，除非明确提供“完整数据库备份”并警告用户。

## UI 安全提示

Settings 页必须显示：

- Token status
- Token masked
- Last verified time
- Rate limit
- Permissions health
- Private repo tracking on/off
- AI enabled/disabled
- Data storage path

Setup 页要有提示：

> Your token is encrypted and stored locally. RepoPulse never sends your GitHub token to AI providers.

## 开源默认值

默认配置必须安全：

- `AI_ENABLED=false`
- `ALLOW_ANONYMOUS_TELEMETRY=false`
- `EMAIL_ENABLED=false`
- `WEBHOOK_ENABLED=false`
- MySQL-first `DATABASE_URL` with placeholder-only credentials
- 不含任何真实密钥
