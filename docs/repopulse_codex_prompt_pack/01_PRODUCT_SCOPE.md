# 01 - 产品定位与范围

## 产品名称

**RepoPulse**

可以理解为：仓库的脉搏、开源项目的增长心跳。

## 产品定位

RepoPulse 是一个开源、自托管的 GitHub 仓库数据监控和每日报告系统。

它的核心价值不是替代 GitHub 首页，而是解决 GitHub 原生统计的几个痛点：

1. GitHub Traffic 数据只展示短期窗口，不适合长期趋势分析。
2. GitHub Release 下载量只显示累计值，不显示每天新增多少。
3. 多个仓库的数据分散在各个仓库页面，无法统一看全局增长。
4. 个人开发者和小团队缺少一个轻量、漂亮、可自托管的数据面板。
5. 开源项目维护者希望每天知道：谁涨了、哪个 release 被下载了、哪里异常了、该做什么。

RepoPulse 的一句话卖点：

> GitHub 只给你短期 Traffic，RepoPulse 帮你保存长期历史，并每天生成仓库增长报告。

## 目标用户

- 个人开源作者
- 独立开发者
- 小团队
- 有多个 GitHub 仓库的人
- 发布 Release / APK / CLI / 桌面安装包的人
- 希望看下载趋势和增长报告的人

## 非目标用户

MVP 不针对大型企业级 GitHub 数据平台，不做复杂多租户，不做审计合规平台，不做替代 GitHub Enterprise 的系统。

## 核心用户故事

### 用户故事 1：个人开源作者

我有 10 个 GitHub 仓库，其中 2 个有 Release 安装包。我希望每天自动知道：

- 哪个仓库新增 stars 了
- 哪个安装包下载增加了
- 有没有人 clone
- 哪个页面被访问最多
- 最近 7 天有没有异常增长

### 用户故事 2：Android APK 作者

我在 GitHub Release 发布 APK。我希望看到：

- 每个 APK 文件累计下载多少
- 今天新增下载多少
- 哪个版本最受欢迎
- Release 页面访问和下载的关系

### 用户故事 3：小团队

我们团队有 30 个仓库，希望用一个 self-hosted dashboard 统一看项目健康度、同步状态、周报和异常提醒。

## MVP 功能范围

MVP 必须包含：

- GitHub Token 连接
- 仓库选择
- 每日定时同步
- 手动同步
- SQLite 数据库持久化
- Overview 总览页
- Repositories 仓库列表页
- Repository Detail 单仓库详情页
- Releases / Downloads 下载统计页
- Reports 每日报告页
- Settings 设置页
- 基础 AI 总结模块，可关闭
- Docker Compose 部署

## 第二阶段功能

第二阶段可以做：

- GitHub App 授权
- 多用户 / 团队空间
- Alerts / Automation 独立页面
- Integrations 独立页面
- Telegram / Discord / Slack / 企业微信推送
- Webhook
- AI 问答
- Star History 分享图
- Public read-only dashboard
- 多数据库正式支持：MySQL / PostgreSQL
- 插件系统

## 明确不做或暂缓

第一版不要做：

- 复杂 RBAC 权限系统
- SaaS 云端账号系统
- 移动端 App
- 复杂自定义 Dashboard Builder
- 直接分析私有仓库代码内容
- 从 GitHub 之外抓取用户隐私数据
- 未经用户同意上传 telemetry

## 产品闭环

MVP 的完整闭环：

```text
部署 → 登录 → 填 GitHub Token → 选择仓库 → 设置同步时间 → 手动同步一次 → 每天自动同步 → 看总览 → 看仓库详情 → 看下载统计 → 看每日报告
```

这个闭环必须稳定、清晰、低配置成本。

## 开源项目气质

RepoPulse 最终要开源，所以要做到：

- README 清晰
- 安装简单
- 默认安全
- 不偷偷上传数据
- 不强依赖付费服务
- AI 是可选增强，不是必需品
- 可以本地离线看历史数据
- 支持导出数据
- 代码结构容易二次开发
