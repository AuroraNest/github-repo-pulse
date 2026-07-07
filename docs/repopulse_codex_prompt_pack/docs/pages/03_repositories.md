> 本文是给 Codex 的页面级实现提示词。实现时请同时遵守 `docs/02_master_codex_prompt.md`、`docs/04_design_system.md` 和数据库/API 文档。

# 页面 03：Repositories 仓库列表页

## 页面目标

管理所有被 RepoPulse 发现和监控的 GitHub 仓库。

回答：

> 哪些仓库正在被监控？它们的状态和核心指标如何？

## 路由

```text
/repositories
```

## UI 结构

参考 UI 图 `repopulse_仓库管理仪表盘.png`。

顶部：

- 页面标题 Repositories。
- 搜索框。
- Tracking 18 repos。
- Last sync。

过滤：

- All / Active / Private / Public / Favorites。
- Language。
- Growth。
- Traffic。
- Release Enabled。
- More filters。

摘要卡片：

- Total Tracked Repositories。
- Active Alerts。
- Fastest Growing。

主表格：

列：

```text
Repository
Visibility
Stars
Forks
14-Day Visitors
14-Day Clones
Total Downloads
Latest Release
Last Sync
Status
Actions
```

Actions：

- View detail。
- View reports。
- Sync now。
- Pause tracking。

## API

```text
GET /api/repositories?query=&visibility=&language=&status=&sort=&page=&pageSize=
PATCH /api/repositories/:id
POST /api/repositories/:id/sync
```

## 行数据结构

```json
{
  "id": "...",
  "fullName": "AuroraNest/Modify_Positioning",
  "owner": "AuroraNest",
  "name": "Modify_Positioning",
  "visibility": "public",
  "language": "Kotlin",
  "stars": 19,
  "forks": 3,
  "visitors14d": 42,
  "clones14d": 3,
  "totalDownloads": 72,
  "latestRelease": "apk-20260529-093853",
  "lastSync": "2026-07-07T08:00:00Z",
  "status": "healthy",
  "sparklines": {
    "stars": [],
    "downloads": [],
    "views": [],
    "clones": []
  }
}
```

## 状态规则

```text
healthy: 最近一次同步成功
warning: traffic forbidden / 部分指标不可用
error: 最近同步失败
paused: 用户暂停 tracking
```

## 表格行为

- 支持搜索和分页。
- 支持排序：stars、forks、downloads、visitors、clones、lastSync。
- 支持批量启用/暂停 tracking。
- 支持表格 loading skeleton。

## Acceptance Criteria

- 可以列出所有仓库。
- 可以搜索/过滤/排序。
- 可以手动同步单个仓库。
- 可以点击进入 Repository Detail。
- private repo 有明确 lock badge。
- 权限不足的 traffic 显示 warning，不影响其他指标。
