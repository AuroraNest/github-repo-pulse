> 本文是给 Codex 的页面级实现提示词。实现时请同时遵守 `docs/02_master_codex_prompt.md`、`docs/04_design_system.md` 和数据库/API 文档。

# 页面 01：Setup / Connect GitHub

## 页面目标

首次部署后，用户通过此页面完成初始化：

1. 填写 GitHub Token。
2. 验证 token。
3. 发现仓库。
4. 选择要监控的仓库。
5. 设置每日同步时间和数据保留策略。
6. 点击 Start Tracking，进入 Overview。

## 路由

```text
/setup
```

如果 setup 已完成，访问 `/setup` 仍可显示当前配置，但按钮变为 `Update Tracking`。

## UI 结构

页面参考 UI 图 `repopulse初始设置界面.png`。

布局：

- 左侧 Sidebar，Setup 高亮。
- 主内容：三步大卡片。
- 右侧：`What will be collected` 汇总卡片。

### Step 1：Add GitHub Token

组件：

- Token 输入框，默认 password 类型。
- eye icon 切换显示/隐藏。
- Verify Token 按钮。
- 权限 checklist。
- 安全提示：token 会加密保存。

交互：

- 用户输入 token 后点击 Verify。
- 成功显示 GitHub login、rate limit、权限提示。
- 失败显示明确错误。
- 验证成功前 Step 2 禁用。

错误文案示例：

```text
Invalid or expired GitHub token.
RepoPulse could not access your repository list.
Traffic metrics may require Administration read permission.
```

### Step 2：Choose repositories to track

组件：

- Search repositories。
- Select all。
- Repository list/table。
- Checkbox。
- visibility badge。
- star/fork/visibility preview。

字段：

```text
repo icon
fullName
description/language
visibility
stars
forks
updatedAt
selected
```

交互：

- 搜索本地已发现仓库。
- 勾选/取消。
- 全选/反选。
- 至少选择一个仓库才能继续。

### Step 3：Schedule daily sync

组件：

- Daily sync time。
- Timezone。
- Data retention：90 days / 12 months / forever。
- Collect private repositories checkbox。
- Start Tracking 按钮。

默认值：

```text
sync time: 08:00
retention: 12 months
collect private: false
```

## API 依赖

```text
POST /api/setup/verify-token
POST /api/setup/discover-repositories
POST /api/setup/complete
GET  /api/setup/status
```

## 数据写入

`/api/setup/complete` 要完成：

1. 加密保存 token 到 `github_connections`。
2. upsert repositories。
3. 设置 selected repos `isTracked=true`。
4. 保存 settings。
5. 创建首次 sync run，后台执行或提示手动同步。
6. 设置 `setup.completed=true`。

## Loading / Empty / Error

- 验证 token 时按钮 loading。
- 发现仓库时显示 skeleton。
- 没有仓库时显示 empty state。
- 403 权限不足时显示 warning，而非全局崩溃。

## Acceptance Criteria

- 用户能填 token 并验证。
- 验证成功后能看到仓库列表。
- 用户能选择仓库并保存设置。
- 保存后跳转 Overview。
- token 不出现在前端返回 JSON 和日志里。
- 页面刷新后状态不丢。
