# 04. 设计系统与 UI 风格

UI 参考刚才生成的图片。总体方向是 Apple 风格的克制、清爽、精致，而不是花哨的游戏化 dashboard。

## 视觉关键词

- 轻盈
- 克制
- 高级
- 留白
- 圆角
- 微阴影
- 柔和渐变
- 低饱和背景
- 清晰的数据层级
- 类 macOS 的精致感

不要直接使用 Apple Logo 或复制任何 Apple 页面。

## 色彩建议

背景：

```text
--background: #f7f9fc
--surface: rgba(255,255,255,0.82)
--surface-solid: #ffffff
--border: #e5eaf2
--text-primary: #0f172a
--text-secondary: #64748b
--muted: #94a3b8
```

强调色：

```text
blue:   #2563eb
cyan:   #06b6d4
green:  #16a34a
purple: #7c3aed
pink:   #ec4899
amber:  #f59e0b
red:    #ef4444
```

## 组件风格

### Card

- 圆角：`rounded-2xl` 或 `rounded-3xl`。
- 背景：白色/半透明白。
- 边框：1px light border。
- 阴影：非常淡，不要厚重。
- 内边距：20px / 24px。

### Sidebar

- 固定左侧。
- 宽度 240px 左右。
- 当前菜单用浅蓝背景 + 蓝色 icon/text。
- 底部展示 system status 和 tracking count。

### TopBar

- 页面标题 + 副标题。
- 中间搜索框。
- 右侧：Tracking repos 状态、Last sync、主题按钮、Refresh。

### MetricCard

结构：

```text
icon circle
label
big number
growth indicator
sparkline
```

状态颜色：

- 正增长：green。
- 负增长：red。
- 中性：gray。

### Charts

- 使用 Recharts。
- 线条细，但清晰。
- Grid 使用浅灰虚线。
- Tooltip 做成圆角浮层。
- 图例简洁。
- 不要 3D，不要重阴影。

### Tables

- 表头浅灰背景。
- 行高充足。
- hover 状态轻微变色。
- 行内显示 repo icon、name、language、badges。
- 数字列右对齐或居中。
- 可排序列显示小箭头。

## 响应式要求

第一版优先桌面端，但要基本适配：

- >= 1280px：完整 sidebar + dashboard grid。
- 768px-1279px：sidebar 可折叠，grid 变 2 列。
- < 768px：移动端栈式布局，表格变 card list。

## 页面视觉重点

### Overview

看起来像“控制中心”。第一屏必须展示最关键 KPI。

### Repositories

强调可管理性。表格要清晰，不要花。

### Repository Detail

像“单仓库驾驶舱”。顶部 repo header 很重要。

### Releases

突出 downloads。下载趋势图和 asset 表格是核心。

### Reports

像“日报中心”。文字报告和数据卡片结合。

### Settings

像 macOS 系统设置。多个设置卡片，清晰分组。

## 文案语气

- 专业、简短、明确。
- 不要夸张营销。
- 报告页可以略微自然语言化。

示例：

```text
Modify_Positioning gained 8 new APK downloads today.
Traffic is stable. Release page views increased by 12% compared with the 7-day average.
```
