# 10 - 页面：Repositories 仓库列表页

## 页面作用

管理和查看所有被监控的仓库。

回答问题：

> 我有哪些仓库正在被监控？它们各自表现如何？哪些仓库需要关注？

## 路由

```text
/repositories
```

## 页面顶部

标题：Repositories

副标题：Browse and manage all tracked GitHub repositories.

顶部控件：

- Search repositories
- Tracking 18 repos
- Last sync
- Refresh

## 筛选区

Segmented tabs：

- All
- Active
- Private
- Public
- Favorites

Filter chips：

- Language
- Growth
- Traffic
- Release Enabled
- More filters

排序：

- stars
- forks
- visitors
- clones
- downloads
- last sync
- updated_at

## Summary cards

3 张卡：

1. Total Tracked Repositories
2. Active Alerts
3. Fastest Growing

## 表格列

```text
Repository
Visibility
Language
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

Repository cell：

- icon/avatar
- name
- full_name
- favorite star

Visibility：

- Public green chip
- Private purple chip

指标列：

- value
- mini sparkline

Status：

- Healthy
- Warning
- Error
- Syncing

Actions：

- View
- Report
- Sync now
- More

## 行交互

- 点击行进入 `/repositories/:id`
- Sync now 触发单仓库同步
- Favorite 切换收藏
- Toggle tracked 可以放到 More menu

## API

```text
GET /api/repositories
PATCH /api/repositories/:id
POST /api/repositories/:id/sync
```

## 空状态

```text
No repositories are being tracked.
Connect GitHub or select repositories from Setup.
```

## 错误状态

如果某些仓库权限失败，行内 status 显示 Warning。Tooltip 显示：

```text
Traffic data unavailable. Token may need additional permissions.
```

## 验收标准

- 支持搜索
- 支持分页
- 支持筛选 public/private
- 支持排序
- 支持手动同步单仓库
- 表格 loading skeleton
- 每行状态清楚
- 不同仓库数值显示正确
