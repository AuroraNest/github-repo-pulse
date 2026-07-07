> 本文是给 Codex 的页面级实现提示词。实现时请同时遵守 `docs/02_master_codex_prompt.md`、`docs/04_design_system.md` 和数据库/API 文档。

# 页面 02：Overview 总览页

## 页面目标

Overview 是进入系统后的首页，用来回答：

> 我的所有 GitHub 仓库今天整体表现怎么样？

## 路由

```text
/overview
```

`/` 在 setup 完成后重定向到 `/overview`。

## 核心内容

顶部 KPI：

- Total Stars
- Total Forks
- Total Release Downloads
- Today’s New Downloads
- 14-Day Visitors
- 14-Day Clones

图表：

- 30-Day Growth Trends：stars/forks/downloads。
- Views vs Clones：views/clones/ratio。

列表：

- Fastest Growing Repositories。
- Top Releases。
- Activity Feed。
- Anomalies optional。

## UI 结构

参考 UI 图 `repopulse_仓库分析仪表板截图.png`。

布局：

```text
TopBar
KPI card row
Main charts row
Lower cards: fastest repos / top releases / activity feed
```

## 数据接口

```text
GET /api/dashboard/overview?range=30d
```

返回结构建议：

```json
{
  "totals": {
    "stars": 12840,
    "forks": 3210,
    "releaseDownloads": 98760,
    "newDownloadsToday": 2340,
    "visitors14d": 24680,
    "clones14d": 6320
  },
  "deltas": {
    "stars30dPercent": 8.7,
    "forks30dPercent": 6.3,
    "downloads30dPercent": 12.4
  },
  "trends": [
    { "date": "2026-07-01", "stars": 100, "forks": 20, "downloads": 72, "views": 97, "clones": 3 }
  ],
  "fastestGrowingRepositories": [],
  "topReleases": [],
  "activityFeed": []
}
```

## 计算逻辑

- Total Stars = 最新 repository_snapshots stars 求和。
- Total Forks = 最新 forks 求和。
- Total Release Downloads = 每个 asset 最新 snapshot downloadCount 求和。
- Today’s New Downloads = 今天最新累计 - 昨天累计。
- 14-Day Visitors = 最近 14 天 uniqueVisitors 求和或 GitHub 14d 聚合。
- 14-Day Clones = 最近 14 天 clones 求和。

注意：unique visitors across repos 不能简单精确去重，因为 GitHub 不提供跨仓库用户身份。页面文案应写 `sum of per-repository unique visitors` 或避免过度精确。

## Activity Feed 规则

自动生成活动：

- repo stars 增长。
- asset downloads 增长。
- traffic spike/drop。
- sync failed。
- new release detected。

## Empty State

如果没有数据：

```text
No snapshots yet. Run your first sync to start tracking repository history.
```

按钮：`Run sync now`。

## Acceptance Criteria

- 首页能显示汇总 KPI。
- 能正确处理没有昨天数据的 delta。
- 图表可读，有 tooltip。
- Activity Feed 至少展示最近 10 条。
- 手动刷新按钮可触发同步或刷新数据。
