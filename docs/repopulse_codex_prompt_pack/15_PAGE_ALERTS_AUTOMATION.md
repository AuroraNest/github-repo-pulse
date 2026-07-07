# 15 - 页面：Alerts / Automation 告警规则页

## 页面作用

设置自动化提醒和规则。

回答问题：

> 当仓库数据出现明显变化时，我希望系统提醒我。

## 路由

```text
/alerts
```

## 功能范围

MVP 可以先把基础规则放到 Settings；第二阶段做独立页面。

## 页面结构

### Summary Cards

- Active Rules
- Alerts Triggered Today
- Unresolved Alerts
- Notification Channels

### Rules Table

列：

```text
Rule Name
Metric
Condition
Scope
Channels
Status
Last Triggered
Actions
```

### Rule Builder

创建规则：

- Rule name
- Metric
- Condition type
- Threshold
- Window
- Repository scope
- Notification channels
- Enabled

## 支持指标

- downloads
- stars
- forks
- views
- clones
- sync failure
- new release
- traffic permission failure

## 条件类型

### Absolute threshold

例：今日下载量 >= 50。

### Percentage increase

例：今日下载比昨天上涨 20%。

### Percentage drop

例：今日下载比 7 日均值下降 50%。

### Spike vs average

例：今天 clone > 过去 7 天平均值 * 2。

### Consecutive failure

例：同步连续失败 3 次。

## 默认规则

首次安装时可以创建默认规则：

1. Notify when downloads spike by 20%
2. Alert when sync fails
3. Alert when traffic permission is missing
4. Create weekly digest every Monday

默认全部可关闭。

## 通知渠道

MVP：

- In-app
- Webhook 可选

第二阶段：

- Email
- Telegram
- Discord
- Slack
- 企业微信

## API

```text
GET /api/alerts/rules
POST /api/alerts/rules
PATCH /api/alerts/rules/:id
DELETE /api/alerts/rules/:id
GET /api/alerts/events
PATCH /api/alerts/events/:id
```

## Worker 逻辑

每次 sync 后调用：

```ts
evaluateAlertRules(periodDate)
```

逻辑：

- 读取 enabled rules
- 计算对应 metric
- 判断是否触发
- 创建 alert_event
- 创建 activity_event
- 调通知渠道

## AI 结合

AI 可以对告警做解释：

```text
Downloads spiked because the release page received more visits from github.com and x.com today. Consider improving the release notes.
```

AI 失败时不影响告警。

## 验收标准

- 可以创建规则
- 可以启用/禁用规则
- 同步后能触发事件
- In-app alerts 可见
- 不重复疯狂触发同一规则：需要 cooldown 或每天一次限制
