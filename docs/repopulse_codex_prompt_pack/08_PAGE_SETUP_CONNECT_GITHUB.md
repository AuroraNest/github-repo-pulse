# 08 - 页面：Setup / Connect GitHub

## 页面作用

首次部署后引导用户完成配置。

目标：

> 用户填入 GitHub Token，选择仓库，设置每日同步时间，然后点击 Start Tracking。

## 路由

```text
/setup
```

如果 setup 已完成，可以跳转到 Overview。Settings 里可以重新进入连接管理。

## 页面结构

### Header

标题：

```text
Connect GitHub
```

副标题：

```text
Set up RepoPulse in 3 simple steps and start tracking your repositories.
```

右上角：Need help? 按钮。

### Step 1: Add GitHub Token

卡片内容：

- Step number 1
- 标题：Add GitHub Token
- 说明：Use a read-only token to securely access your GitHub data.
- Personal Access Token input
- 显示/隐藏按钮
- Verify Token 按钮
- 权限检查列表
- 绿色安全提示：Your token is encrypted and stored locally.

交互：

1. 用户输入 token
2. 点击 Verify Token
3. 调 `/api/setup/verify-token`
4. loading
5. 成功后显示 account login / avatar / permission checklist
6. 失败显示错误：token invalid、权限不足、rate limit 等

权限列表：

- Read user profile
- Read repository metadata
- Read public repositories
- Read private repositories if selected
- Read traffic data
- Read releases and assets

注意：权限检查不要假装 100% 准确。如果某些权限只能在同步 traffic 时确认，则显示 `May require additional permissions`。

### Step 2: Choose repositories to track

内容：

- Search repositories input
- Select all button
- include private checkbox
- repository list
- 每行：checkbox、icon/avatar、repo full_name、visibility、language、stars、forks、last updated

仓库例子：

- Modify_Positioning
- Queue
- toolbox
- devstatus-lite
- knowledge
- remodex-android

状态：

- Loading repositories
- No repositories found
- Token required
- Error fetching repositories

交互：

- 选择/取消选择
- 全选当前结果
- 筛选 public/private
- 搜索

### Step 3: Schedule daily sync

内容：

- Daily sync time
- Timezone
- Data retention
- Collect private repositories
- Enable AI summary toggle
- Start Tracking 按钮

默认值：

```text
Daily sync time: 08:00
Timezone: UTC
Data retention: 12 months recommended
AI summary: disabled
```

Start Tracking 逻辑：

1. 校验 token 已验证
2. 校验至少选择 1 个仓库
3. 保存 token
4. 保存 repositories.tracked
5. 保存 sync settings
6. setup_completed=true
7. 触发第一次手动 sync
8. 跳转 `/overview` 或 `/`

### Right Panel: What will be collected

显示：

- Stars
- Forks
- Traffic
- Clones
- Release Downloads
- Popular Pages
- Referrers
- Daily Summaries

每项有 `Daily` chip。

底部：Start Tracking 按钮。

## UI 要求

- 三步卡片纵向排列
- 右侧 summary panel sticky
- 大量留白
- 安全感强
- 蓝色主按钮
- 绿色成功状态
- 红色错误提示克制展示

## 页面数据 API

- `POST /api/setup/verify-token`
- `GET /api/setup/repositories`
- `POST /api/setup/complete`
- `GET /api/setup/status`

## 验收标准

- 未输入 token 时 Verify 按钮 disabled
- token 验证失败有明确错误
- 验证成功显示 GitHub account
- 可以搜索仓库
- 可以选择仓库
- 没有选择仓库不能 Start Tracking
- Start Tracking 成功后跳转 Overview
- Token 不会在前端持久化明文
