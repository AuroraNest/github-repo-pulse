# 12 - 页面：Releases / Downloads 下载统计页

## 页面作用

专门展示 Release 和安装包下载数据。

这是 RepoPulse 的核心差异化页面。

回答问题：

> 哪个仓库的哪个安装包下载最多？今天新增下载多少？哪个版本最受欢迎？

## 路由

```text
/releases
```

## KPI cards

1. Total Release Downloads
2. Today’s New Downloads
3. Active Releases
4. Most Downloaded Asset

Most Downloaded Asset 例子：

```text
Modify_Positioning-installable-f6fb4b9.apk
72 downloads
```

## 图表

### Cumulative Downloads Over Time

面积图，展示所有 assets 累计下载总量。

### Daily New Downloads by Repository

堆叠柱状图，展示每天各仓库新增下载。

### Downloads by Asset Type 可选

apk / zip / dmg / tar.gz / exe。

## Top Assets side panel

排行：

- asset name
- repository
- downloads
- daily delta

## Recent Release Activity

事件：

- New release published
- Spike in downloads
- Asset removed
- Download count reset

## Release Assets Table

列：

```text
Repository
Version / Tag
Asset Name
Asset Size
Published Date
Total Downloads
Today
7-Day
30-Day
Status
Actions
```

行例子：

```text
Modify_Positioning | v2.3.0 | Modify_Positioning-installable-f6fb4b9.apk | 28.6 MB | May 29 | 72 | +3 | +14 | +72 | Active
Queue | v1.8.1 | Queue-darwin-arm64.zip | 18.4 MB | ...
```

Actions：

- View GitHub release
- Copy download URL
- View trend

## 筛选

- repository
- tag
- asset type
- date range
- min downloads
- only active

## API

```text
GET /api/releases
GET /api/repositories/:id/releases
```

## 计算逻辑

### total downloads

每个 asset 最新 snapshot download_count 求和。

### today downloads

今天所有 asset snapshot daily_delta 求和。

### 7-day / 30-day downloads

指定范围内 daily_delta 求和。

### active releases

非 draft 且非 archived repo 的 releases。

## 特殊情况

### 第一次同步

第一次同步时不要把历史累计当成今日新增。

处理：

- `daily_delta = 0`
- UI 显示：Baseline captured

### Asset 删除

如果 GitHub release asset 被删除：

- release_assets 标记 inactive 或 last_seen_at
- 历史 snapshot 保留

### Download count reset

如果 today < previous：

- delta = 0
- 创建 warning activity event

## 验收标准

- 能看到所有 assets
- 能按下载量排序
- 能看到 Modify_Positioning APK 的 72 downloads 示例/真实数据
- 能看到今日新增
- 第一次同步不误报新增
- 图表和表格一致
- 支持搜索 asset
