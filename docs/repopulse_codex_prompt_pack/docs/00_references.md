# 00. 官方参考与关键限制

本项目需要围绕 GitHub API 的真实能力来设计。以下是实现时必须遵守的事实基础。

## GitHub Traffic 数据

GitHub REST API 提供 repository traffic endpoints：

- `GET /repos/{owner}/{repo}/traffic/views`
- `GET /repos/{owner}/{repo}/traffic/clones`
- `GET /repos/{owner}/{repo}/traffic/popular/paths`
- `GET /repos/{owner}/{repo}/traffic/popular/referrers`

关键限制：

- Traffic endpoints 只对有写权限的仓库可用。
- clones / views 返回最近 14 天的按日或按周数据。
- popular paths / referrers 也是最近 14 天的 Top 10 数据。
- fine-grained token 通常需要 repository `Administration: read` 权限才能读 traffic。

官方文档：

- https://docs.github.com/en/rest/metrics/traffic?apiVersion=2022-11-28

## GitHub Release 下载数据

Release asset 数据里包含 `download_count` 字段。这个字段是累计下载量。

RepoPulse 应该每天保存 asset 的 `download_count` 快照，然后计算：

```text
今日新增下载 = 今天累计 download_count - 昨天累计 download_count
7 日新增下载 = 今天累计 download_count - 7 天前累计 download_count
30 日新增下载 = 今天累计 download_count - 30 天前累计 download_count
```

官方文档：

- https://docs.github.com/en/rest/releases/assets?apiVersion=2022-11-28

## GitHub API Rate Limit

认证请求一般是 5,000 requests/hour。GitHub App installation token 的额度规则与安装仓库数、组织情况有关。实现时必须保存和展示 rate limit 状态，避免并发过高触发 secondary rate limit。

官方文档：

- https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28

## OpenAI / AI 模块

AI 模块是可选增强。OpenAI Responses API 可用于生成模型响应。实现时应通过环境变量配置 provider、base URL、model，不要硬编码模型名称。

官方文档：

- https://platform.openai.com/docs/api-reference/responses

## 产品设计上的推论

因为 GitHub Traffic 只保留短期数据，所以 RepoPulse 的核心价值是：

> 定时采集 + 长期保存 + 趋势分析 + 每日报告。

不要承诺能补回用户部署之前的完整历史。对于历史数据，只能拿到：

- 当前仓库基础信息，比如 stars/forks/open issues。
- 当前 release asset 的累计 download_count。
- 最近 14 天 traffic 快照。

从安装 RepoPulse 之后开始，才能形成完整长期趋势。
