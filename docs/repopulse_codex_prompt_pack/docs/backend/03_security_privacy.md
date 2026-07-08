# Backend 03：安全与隐私

## 核心原则

RepoPulse 是自托管项目，但仍然必须默认安全。

绝对禁止：

- 在日志打印 GitHub Token。
- 在前端返回 encryptedToken。
- 在报告/导出文件中包含密钥。
- 把 private repo 的源码内容发给 AI。
- 默认启用匿名遥测。

## 密钥管理

环境变量：

```env
APP_SECRET=change-me-to-a-long-random-string
```

用 `APP_SECRET` 派生加密 key，使用 AES-256-GCM 加密：

- GitHub Token。
- OpenAI API Key。
- Webhook Secret。
- SMTP Password。

实现：

```text
src/server/security/encryption.ts
```

函数：

```ts
encryptSecret(plain: string): string
decryptSecret(cipher: string): string
maskSecret(secret: string): string
```

## Token 展示

前端只显示：

```text
ghp_•••••••••••• saved
last verified at ...
```

## AI 隐私

Settings 中提供：

```text
Include private repository names in AI summaries
```

默认关闭。

如果关闭，AI 输入中 private repo 名称用匿名 ID 替换。

## Auth

MVP 可实现简单管理员登录：

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- httpOnly cookie。
- CSRF token for mutations optional。

如果选择不做登录，必须在 README 中写：

```text
RepoPulse should be deployed behind a private network or reverse proxy authentication.
```

## Docker 安全

- 不要在 image 中 bake `.env`。
- `.env.example` 只给占位符。
- data volume 用户自己保存。
- 容器尽量非 root 用户运行。

## 导出安全

导出默认不包含：

- encryptedToken。
- API keys。
- password hash。
- webhook secret。

## 删除数据

Delete all data：

- 二次确认。
- 要求输入 `DELETE`。
- 删除数据库记录和导出文件。
- 不删除 `.env`。

## SECURITY.md 内容

开源项目要有 SECURITY.md：

- 如何报告漏洞。
- 支持版本。
- 不要在 issue 公开贴 token。
- 安全建议。

## Acceptance Criteria

- 搜索代码没有 `console.log(token)` 之类风险。
- API 返回没有 token 字段。
- 备份导出不包含密钥。
- AI 输入中没有 secret。
