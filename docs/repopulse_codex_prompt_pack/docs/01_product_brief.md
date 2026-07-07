# 01. 产品说明：RepoPulse

## 一句话定位

RepoPulse 是一个开源、自托管的 GitHub 仓库增长监控与每日报告系统。

它帮助个人开发者、小团队、开源作者每天自动保存仓库数据，并把 stars、forks、clones、views、release downloads 等指标转成长期趋势和可读报告。

## 用户痛点

GitHub 自带 Insights/Traffic 很有用，但存在几个问题：

1. Traffic 数据只保留短期窗口，长期趋势会丢失。
2. Release asset downloads 虽然是累计值，但 GitHub 不提供每日新增趋势。
3. 多仓库数据分散，需要逐个点进去看。
4. 缺少每日总结：今天哪个仓库涨了？哪个安装包下载变多？是否有异常？
5. 对个人开发者来说，Google Analytics、复杂 BI 系统太重。

## 产品目标

RepoPulse 的第一版必须做到：

- 部署简单：`docker compose up -d` 后可用。
- 默认轻量：Docker Compose 可启动 MySQL + web + worker。
- 数据可控：所有数据保存在用户自己的服务器。
- 定时采集：每天自动同步 GitHub 数据。
- 可视化：有总览页、仓库页、下载页、报告页。
- 可导出：支持 Markdown/CSV/JSON，PDF 可作为增强。
- 可扩展：后续可支持 PostgreSQL/SQLite adapter、GitHub App、AI 总结、通知渠道。

## 目标用户

- 个人开源作者。
- 小型开源团队。
- 想追踪自己工具/APP 发布效果的开发者。
- 需要长期保存 GitHub Traffic 和 Release 下载趋势的人。

## 非目标

第一版不要做成复杂企业级平台。不要在 MVP 做：

- 多租户 SaaS。
- 复杂团队权限。
- GitHub Marketplace 上架。
- 复杂自定义仪表盘。
- 必须付费的 AI 功能。
- 移动端 App。

## MVP 成功标准

用户完成以下路径，项目就成立：

```text
部署 RepoPulse
→ 打开 Setup 页面
→ 填 GitHub Token
→ 选择要监控的仓库
→ 设置每天同步时间
→ 第二天看到趋势变化
→ 查看每日报告
→ 导出报告或数据
```

## 核心指标

系统内部需要围绕这些指标建模：

- Repository base metrics：stars、forks、watchers/subscribers、open issues、language、topics、license、pushed_at。
- Traffic metrics：views、unique visitors、clones、unique cloners。
- Popular content：path、title、views、unique visitors。
- Referrers：source、views、unique visitors。
- Release metrics：release、tag、asset name、asset size、download_count、daily_delta。
- Growth metrics：daily/weekly/monthly delta、growth rate、ranking。
- Report metrics：highlights、anomalies、suggested actions。

## 产品口号建议

可在 README 或首页中使用：

> GitHub only shows short-term traffic. RepoPulse saves your long-term repository history.

中文：

> GitHub 只给你短期 Traffic，RepoPulse 帮你保存长期历史。
