# 07 - UI 设计系统

## 设计目标

RepoPulse 的 UI 要看起来像一个成熟的、精致的、安静的、值得信任的开源产品。

设计参考苹果的理念：

- 简洁
- 克制
- 留白
- 高可读性
- 精致圆角
- 柔和阴影
- 轻盈层级
- 不喧宾夺主
- 让数据成为主角

注意：不要使用 Apple logo，不要复制任何 Apple 具体产品页面。只是借鉴设计理念。

## 视觉关键词

```text
clean
premium
calm
light
minimal
frosted glass
soft shadow
rounded cards
spacious
crisp typography
subtle motion
```

## 布局

所有页面共用：

- 左侧 Sidebar
- 顶部 Header
- 主内容区域
- 页面底部轻量 footer

### Sidebar

宽度建议：240px。

包含：

- RepoPulse logo
- Overview
- Repositories
- Releases
- Reports
- Activity
- Alerts
- Settings
- Integrations
- System Status card
- Tracking card
- Admin profile

MVP 可以先显示：

- Overview
- Repositories
- Releases
- Reports
- Settings

其他页面可以灰度或后续实现。

### Header

包含：

- 页面标题
- 页面副标题
- Search repositories
- Tracking status chip
- Last sync chip
- Theme toggle
- Refresh button

## 色彩

建议 Tailwind 主题：

```text
background: #F8FAFC
surface: #FFFFFF
surface-muted: #F1F5F9
border: #E2E8F0
text-primary: #0F172A
text-secondary: #64748B
blue-primary: #2563EB
green-success: #16A34A
yellow-star: #F59E0B
purple-fork: #8B5CF6
pink-traffic: #EC4899
teal-download: #14B8A6
red-danger: #EF4444
```

卡片背景可以用轻微透明：

```css
background: rgba(255, 255, 255, 0.78);
backdrop-filter: blur(16px);
border: 1px solid rgba(226, 232, 240, 0.8);
```

## 字体

使用系统字体：

```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

## 组件

### KPI Card

用途：展示 stars、forks、downloads、visitors、clones。

包含：

- 圆形 icon 背景
- label
- 大数字
- 增长率
- 对比说明
- mini sparkline

状态：loading / empty / error。

### Chart Card

包含：

- title
- info tooltip
- date range selector
- chart
- legend
- empty state

### Data Table

用于 Repositories、Release Assets、Sync Logs。

要求：

- sticky header 可选
- 排序
- 分页
- 搜索
- 行操作
- loading skeleton
- empty state

### Status Chip

类型：

- Healthy
- Tracking
- Warning
- Error
- Private
- Public
- Latest
- Active

### Activity Item

包含：

- 彩色 icon
- 事件标题
- 时间
- repo 名
- severity

## 图表规范

用 Recharts。

推荐图表：

- 折线图：趋势
- 柱状图：每日新增
- 面积图：累计下载
- 漏斗图：访问 → Release → 下载
- 排行榜：Top repositories / Top assets

图表不要过度装饰：

- 轻网格线
- 图例清楚
- tooltip 细腻
- 坐标轴简洁
- 数字格式化：1.2k、98.7k

## 页面状态

每个页面必须有：

- Loading skeleton
- Empty state
- Error state
- Manual refresh

空状态文案例子：

```text
No repositories are being tracked yet.
Connect GitHub and select repositories to start collecting daily metrics.
```

错误文案例子：

```text
Traffic data is unavailable for this repository.
Your GitHub token may not have traffic read permissions.
```

## 响应式

MVP 桌面优先。

断点：

- Desktop: >= 1280px 完整 sidebar + grid
- Tablet: >= 768px sidebar 可折叠
- Mobile: 可以后续优化，至少不要崩

## 页面统一元素

所有页面底部显示：

```text
RepoPulse v1.0.0 • Self-hosted • GitHub Analytics Dashboard
```

## UI 验收标准

- 所有页面风格一致
- 页面不拥挤
- 数据层级清楚
- 卡片和图表有留白
- 数字格式统一
- 表格易读
- 空状态和错误状态完整
- 没有硬编码作者自己的仓库，Mock 数据可配置
