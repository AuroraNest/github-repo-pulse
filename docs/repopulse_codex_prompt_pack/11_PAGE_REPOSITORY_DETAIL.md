# 11 - 页面：Repository Detail 单仓库详情页

## 页面作用

查看单个仓库的完整分析。

回答问题：

> 这个仓库为什么涨？谁在看？下载了什么？最近有没有异常？

## 路由

```text
/repositories/[id]
```

## Header

显示：

- Breadcrumb: Repositories > Modify_Positioning
- Repo icon
- Repo name
- Star/favorite button
- description
- Public/Private chip
- language chip
- Last synced chip
- Tracking status
- GitHub external link
- Sync now button

## KPI cards

6 个：

- Stars
- Forks
- 14-Day Views
- 14-Day Clones
- Total Release Downloads / Total APK Downloads
- Today’s New Downloads

## Tabs

建议：

```text
Overview
Traffic
Releases
Reports
Settings
```

MVP 可以先实现 Overview，其他 tab 内容也可以在同页切换。

## Overview Tab

### 90-Day Growth Trends

折线图：

- views
- clones
- downloads
- stars/forks 可选

### Views vs Clones

柱状图 + ratio line。

### Conversion Funnel

漏斗：

```text
Visitors
↓
Release Page Views
↓
Downloads
```

注意：这是估算，不要叫精确转化率。文案：Estimated funnel based on GitHub traffic and release asset download deltas.

### Popular Content

表格：

- Overview
- Releases
- APK release page
- README
- tree paths

字段：

- path/title
- views
- unique visitors
- share / rate

### Referring Sites

来源：

- github.com
- google.com
- x.com
- direct/bookmark
- others

## Traffic Tab

展示：

- views daily
- unique visitors daily
- clones daily
- unique cloners daily
- popular paths snapshots
- referrers snapshots
- 14d summary history

## Releases Tab

展示该仓库 releases / assets：

- tag
- asset name
- total downloads
- daily delta
- 7d delta
- 30d delta
- published date

## Reports Tab

展示与该仓库相关的报告片段。

## Settings Tab

仓库级设置：

- tracking enabled
- include in reports
- alert rules
- custom display name
- ignore forked repo

## API

```text
GET /api/repositories/:id
GET /api/repositories/:id/traffic
GET /api/repositories/:id/releases
POST /api/repositories/:id/sync
PATCH /api/repositories/:id
```

## 计算逻辑

### Total downloads

该 repo 现有 assets 最新 snapshot download_count 求和。

### Today downloads

该 repo 当天 release_asset_snapshots daily_delta 求和。

### Release page views

从 popular_path_snapshots 中 path 包含 `/releases` 或 `/releases/tag` 的 count 求和。

### Funnel

```text
visitors = selected range total views 或 unique visitors
releasePageViews = popular paths 中 releases 路径 count
apkDownloads = selected range asset daily_delta sum
```

## 验收标准

- 能从仓库列表进入
- 有 KPI
- 有图表
- 有 popular paths
- 有 referrers
- 有 releases 数据
- 无 traffic 权限时显示说明，但 repo 基础数据仍显示
- Sync now 可用
