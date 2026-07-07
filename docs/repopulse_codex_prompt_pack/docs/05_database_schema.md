# 05. 数据库设计

默认数据库：SQLite。设计时用 Drizzle ORM。所有时间字段统一 UTC ISO string 或 integer timestamp，建议统一用 `createdAt`, `updatedAt`, `snapshotDate`。

## 设计原则

1. 每天采集的数据必须保存快照。
2. 同一天重复同步同一个仓库时，应 upsert，不要重复插入。
3. Release asset download_count 是累计值，daily delta 通过相邻快照计算。
4. Traffic daily 可以从 GitHub 最近 14 天响应中回填最近 14 天，但只能保证从部署后持续完整。
5. sync_runs 必须记录每次同步整体状态。
6. sync_run_items 必须记录每个仓库的同步状态。
7. Token 必须加密保存。

## 表：settings

系统设置，key-value。

字段：

```text
id
key unique
value json/text
description
createdAt
updatedAt
```

常用 key：

```text
setup.completed
sync.schedule.cron
sync.timezone
data.retention.days
github.includePrivateRepos
ai.enabled
ai.provider
notifications.enabled
```

## 表：github_connections

保存 GitHub 连接信息。

字段：

```text
id
provider = github
authType = pat | github_app
githubLogin
githubUserId
encryptedToken
scopes json/text
rateLimitLimit
rateLimitRemaining
rateLimitResetAt
lastVerifiedAt
status = active | invalid | expired
createdAt
updatedAt
```

注意：

- 不要在 API 返回 encryptedToken。
- UI 只显示 token health，不显示 token 值。

## 表：repositories

仓库主表。

字段：

```text
id
connectionId
githubRepoId unique
owner
name
fullName unique
htmlUrl
cloneUrl
visibility = public | private | internal
isPrivate boolean
isFork boolean
isArchived boolean
isDisabled boolean
isTracked boolean
defaultBranch
language
description
topics json/text
licenseName
createdAtGithub
updatedAtGithub
pushedAtGithub
lastSyncedAt
syncStatus = healthy | warning | error | paused
createdAt
updatedAt
```

索引：

```text
fullName unique
githubRepoId unique
isTracked
owner
language
syncStatus
```

## 表：repository_snapshots

仓库基础指标每日快照。

字段：

```text
id
repositoryId
snapshotDate YYYY-MM-DD
stars
forks
watchers
subscribers
openIssues
sizeKb
networkCount optional
createdAt
```

唯一约束：

```text
(repositoryId, snapshotDate)
```

派生字段不要都存，查询时计算：

```text
starsDelta1d = current.stars - previous.stars
starsDelta7d = current.stars - snapshot7d.stars
```

## 表：traffic_daily

GitHub traffic 的按日数据。

字段：

```text
id
repositoryId
date YYYY-MM-DD
views
uniqueVisitors
clones
uniqueCloners
sourceWindowStartedAt optional
sourceCollectedAt
createdAt
updatedAt
```

唯一约束：

```text
(repositoryId, date)
```

说明：

- GitHub 每次返回最近 14 天。同步时对这 14 天 upsert。
- 如果某天没有返回，默认不要推断为 0，除非 GitHub 返回了明确 0。
- UI 要区分 unknown 和 zero。

## 表：traffic_paths

热门内容页面。

字段：

```text
id
repositoryId
snapshotDate YYYY-MM-DD
path
title
views
uniqueVisitors
rank
createdAt
```

唯一约束：

```text
(repositoryId, snapshotDate, path)
```

## 表：traffic_referrers

来源网站。

字段：

```text
id
repositoryId
snapshotDate YYYY-MM-DD
referrer
views
uniqueVisitors
rank
createdAt
```

唯一约束：

```text
(repositoryId, snapshotDate, referrer)
```

## 表：releases

GitHub releases。

字段：

```text
id
repositoryId
githubReleaseId unique
tagName
name
body
htmlUrl
isDraft
isPrerelease
publishedAt
createdAtGithub
updatedAtGithub
targetCommitish
createdAt
updatedAt
```

唯一约束：

```text
(repositoryId, githubReleaseId)
(repositoryId, tagName)
```

## 表：release_assets

Release assets。

字段：

```text
id
repositoryId
releaseId
githubAssetId unique
name
label
contentType
sizeBytes
browserDownloadUrl
state
digest
createdAtGithub
updatedAtGithub
createdAt
updatedAt
```

唯一约束：

```text
(githubAssetId)
(releaseId, name)
```

## 表：release_asset_snapshots

Release asset 下载量每日快照。

字段：

```text
id
assetId
repositoryId
snapshotDate YYYY-MM-DD
downloadCount
createdAt
```

唯一约束：

```text
(assetId, snapshotDate)
```

派生：

```text
downloadsDelta1d = today.downloadCount - yesterday.downloadCount
downloadsDelta7d = today.downloadCount - sevenDaysAgo.downloadCount
downloadsDelta30d = today.downloadCount - thirtyDaysAgo.downloadCount
```

## 表：sync_runs

一次同步任务。

字段：

```text
id
trigger = schedule | manual | setup | retry
scope = all | selected | repository
status = running | success | partial_success | failed | cancelled
startedAt
finishedAt
durationMs
repositoriesTotal
repositoriesSucceeded
repositoriesFailed
rateLimitBefore
rateLimitAfter
errorMessage
createdAt
```

## 表：sync_run_items

某个仓库在某次同步中的结果。

字段：

```text
id
syncRunId
repositoryId
status = pending | running | success | failed | skipped
startedAt
finishedAt
durationMs
steps json/text
errorCode
errorMessage
createdAt
```

steps 示例：

```json
{
  "repo": "success",
  "trafficViews": "success",
  "trafficClones": "success",
  "popularPaths": "forbidden",
  "popularReferrers": "forbidden",
  "releases": "success"
}
```

## 表：reports

日报/周报/月报。

字段：

```text
id
period = daily | weekly | monthly
reportDate YYYY-MM-DD
startDate
endDate
status = generated | failed
source = rule | ai | mixed
title
summaryMarkdown
summaryJson
metricsJson
createdAt
updatedAt
```

summaryJson 建议结构：

```json
{
  "executiveSummary": "...",
  "highlights": [],
  "anomalies": [],
  "suggestedActions": [],
  "topRepositories": [],
  "topAssets": []
}
```

## 表：ai_generations

AI 调用日志。不要保存敏感密钥。

字段：

```text
id
reportId optional
provider
model
inputHash
promptVersion
status = success | failed
inputTokens optional
outputTokens optional
latencyMs
errorMessage
createdAt
```

## 表：alert_rules

告警规则。

字段：

```text
id
name
metric = downloads | stars | forks | views | clones | sync_failure | rate_limit
scope = all | repository | asset
repositoryId optional
assetId optional
conditionJson
channelsJson
isEnabled
createdAt
updatedAt
```

conditionJson 示例：

```json
{
  "operator": "gt_percent_vs_7d_avg",
  "value": 200
}
```

## 表：alert_events

触发过的告警。

字段：

```text
id
ruleId
repositoryId optional
assetId optional
eventDate
severity = info | warning | critical
message
payloadJson
status = new | acknowledged | resolved
createdAt
```

## 查询视图建议

可以在 service 层实现，不一定建 SQL view：

- `getOverviewMetrics(dateRange)`
- `getRepoListWithLatestSnapshot()`
- `getRepositoryDetail(fullName)`
- `getReleaseAssetMetrics(dateRange)`
- `getDailyReportData(reportDate)`
- `getSyncHealth()`

## Seed / Demo 数据

提供 `pnpm seed:demo` 生成演示数据：

- Modify_Positioning
- Queue
- toolbox
- devstatus-lite
- remodex-android
- knowledge

这样没有 GitHub Token 时也能预览 UI。
