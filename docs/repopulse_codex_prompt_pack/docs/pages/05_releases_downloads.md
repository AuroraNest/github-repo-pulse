> 本文是给 Codex 的页面级实现提示词。实现时请同时遵守 `docs/02_master_codex_prompt.md`、`docs/04_design_system.md` 和数据库/API 文档。

# 页面 05：Releases / Downloads 下载统计页

## 页面目标

专门展示 GitHub Releases 和 Release Assets 的下载数据。

这是 RepoPulse 的重要差异化页面，因为 GitHub 只给 asset 当前累计下载量，不提供长期每日新增趋势。

## 路由

```text
/releases
```

## UI 结构

参考 UI 图 `repopulse_数据面板界面截图.png`。

顶部 KPI：

- Total Release Downloads。
- Today’s New Downloads。
- Active Releases。
- Most Downloaded Asset。

图表：

- Cumulative Downloads Over Time。
- Daily New Downloads by Repository。

右侧：

- Top Assets。
- Recent Release Activity。

主表：Release Assets。

列：

```text
Repository
Version / Tag
Asset Name
Asset Size
Published Date
Total Downloads
Daily Change
7-Day Change
30-Day Change
Status
Actions
```

## 数据示例

真实项目示例：

```text
Repository: AuroraNest/Modify_Positioning
Asset: Modify_Positioning-installable-f6fb4b9.apk
Total Downloads: 72
```

## API

```text
GET /api/releases/summary?range=30d
GET /api/releases/assets?query=&repo=&range=&sort=&page=&pageSize=
GET /api/releases/activity
```

## 计算逻辑

Total Release Downloads：

```text
sum(latest release_asset_snapshots.downloadCount)
```

Today’s New Downloads：

```text
sum(today.downloadCount - yesterday.downloadCount)
```

如果没有 yesterday：显示 `—`。

Daily New Downloads by Repository：

```text
for each date, sum(asset deltas grouped by repository)
```

Most Downloaded Asset：

```text
asset with max latest downloadCount
```

Top Assets：

- 按 total downloads 排。
- 可切换 7d/30d/all。

## Actions

每个 asset 行可以有：

- View GitHub Release。
- Copy download URL。
- View asset history。
- Ignore asset。

## Edge Cases

- Release 没有 assets。
- Asset 被删除：保留历史，状态显示 `deleted`。
- Release 重命名：用 githubAssetId 识别，不用 name。
- 下载量偶尔回退：可能 asset 被替换或 GitHub 数据变化，记录 anomaly。

## Acceptance Criteria

- 能看到所有 asset。
- 能正确显示累计下载和新增下载。
- 能搜索 asset name。
- 能按下载量排序。
- 下载量趋势图来自每日快照，而不是假数据。
