# 09 - 页面：Overview 总览页

## 页面作用

展示所有被监控仓库的整体表现。

回答问题：

> 我的 GitHub 仓库今天整体表现怎么样？

## 路由

```text
/
/overview
```

## 顶部 KPI

展示 6 个 KPI 卡片：

1. Total Stars
2. Total Forks
3. Total Downloads
4. Today’s New Downloads
5. 14-Day Visitors
6. 14-Day Clones

每张卡包含：

- icon
- label
- value
- change percent
- compare text
- mini sparkline

## 主图表

### 30-Day Growth Trends

折线图：

- stars
- forks
- downloads

范围选择：

- Last 7 days
- Last 30 days
- Last 90 days

### Views vs Clones

组合图：

- views bar
- clones bar
- ratio dashed line

## 下方卡片

### Fastest Growing Repositories

按 30 天增长率排序。

显示：

- rank
- repo icon
- repo name
- growth percent
- stars 或 downloads

### Top Releases

显示下载最多的 release / asset。

字段：

- repo
- version
- asset name
- total downloads
- daily delta

### Activity Feed

展示活动事件：

- downloads spike
- new release published
- star milestone
- sync failed
- report generated

## 右上角状态

- Tracking 18 repos
- Last sync 08:00
- Refresh button
- Theme toggle

点击 Refresh：触发 `/api/sync/run` 或刷新数据，MVP 可以只刷新页面数据，手动同步单独按钮也可以。

## 数据来源

API：

```text
GET /api/overview
```

返回：

- kpis
- trends
- viewsVsClones
- fastestGrowingRepositories
- topReleases
- activityFeed

## 空状态

如果还没有 setup：跳转 Setup。

如果 setup 完成但没有数据：

```text
No metrics yet.
Run your first sync to start building historical trends.
```

按钮：Run first sync。

## 异常状态

如果最近同步失败：显示 banner：

```text
Last sync completed with 3 repository errors. View sync logs.
```

## UI 要求

- 首页必须漂亮
- 数据密度适中
- 卡片排列参考生成的 UI 图
- 图表清晰
- activity feed 不要太长
- 所有数字用 formatCompactNumber

## 派生指标

### totalDownloads

所有 latest asset snapshot 的 download_count 求和。

### downloadsToday

所有 release_asset_snapshots 当天 daily_delta 求和。

### visitors14d

最新 traffic_summary_snapshots 的 views_uniques_14d 求和，注意 unique 跨仓库不能严格去重，UI 文案写成 aggregated unique visitors 或 14-day unique visitors across tracked repositories。

### clones14d

同上。

## 验收标准

- 有数据时显示 KPI 和图表
- 无数据时有空状态
- 最近同步失败时有提醒
- 点击 repo 可进入详情
- 点击 release 可进入 Releases 页面或单 release 详情
- 所有图表有 tooltip
