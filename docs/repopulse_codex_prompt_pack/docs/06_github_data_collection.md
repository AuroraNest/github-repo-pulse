# 06. GitHub 数据采集设计

## 采集目标

RepoPulse 每天对所有被 tracking 的仓库采集：

1. Repository metadata。
2. Repository traffic views。
3. Repository traffic clones。
4. Popular paths。
5. Popular referrers。
6. Releases。
7. Release assets。
8. Rate limit 状态。

## GitHub Token 权限建议

MVP 使用 Personal Access Token。

最小权限建议：

- Public repo：public repository read。
- Private repo：selected repositories read。
- Traffic：repository Administration read。
- Metadata read。

UI 上要提示：

```text
Traffic 数据需要仓库写权限或 Administration read 权限。没有该权限时，RepoPulse 仍可采集基础信息和 release download_count，但无法采集 views/clones。
```

## GitHub Client

实现 `src/server/github/client.ts`：

```ts
export function createGitHubClient(token: string): Octokit
```

要求：

- 设置 `X-GitHub-Api-Version`。
- 使用 retry/throttle 插件或手写 rate limit 处理。
- 所有请求记录 request id、remaining、reset 时间。
- 403/404 要可区分：权限不足 vs 仓库不存在。

## Token 验证流程

API：`POST /api/setup/verify-token`

步骤：

1. 接收 token。
2. 调用 `GET /user` 获取 login/id。
3. 调用 `GET /user/repos?per_page=1` 验证 repo list 能力。
4. 读取 response headers 中 rate limit。
5. 返回：

```json
{
  "ok": true,
  "login": "AuroraNest",
  "githubUserId": 75767774,
  "rateLimit": {
    "limit": 5000,
    "remaining": 4820,
    "resetAt": "..."
  },
  "warnings": []
}
```

错误返回：

```json
{
  "ok": false,
  "code": "INVALID_TOKEN",
  "message": "GitHub token is invalid or expired."
}
```

## 仓库发现

实现 `discoverRepositories(connectionId)`。

调用：

```text
GET /user/repos?affiliation=owner,collaborator,organization_member&visibility=all&per_page=100&page=N
```

分页直到没有更多。

保存到 `repositories` 表。不要默认 tracking 所有仓库，Setup 页面让用户选择。可提供 Select all。

## 单仓库同步流程

实现 `syncOneRepository(repositoryId, options)`。

伪代码：

```ts
async function syncOneRepository(repo) {
  const item = await createSyncRunItem(repo)
  try {
    const metadata = await collectRepoMetadata(repo)
    await upsertRepository(metadata)
    await upsertRepositorySnapshot(repo.id, today, metadata)

    const views = await collectTrafficViews(repo)
    await upsertTrafficDaily(repo.id, views)

    const clones = await collectTrafficClones(repo)
    await upsertTrafficDaily(repo.id, clones)

    const paths = await collectPopularPaths(repo)
    await upsertTrafficPaths(repo.id, today, paths)

    const referrers = await collectPopularReferrers(repo)
    await upsertTrafficReferrers(repo.id, today, referrers)

    const releases = await collectReleases(repo)
    await upsertReleasesAndAssets(repo.id, releases)
    await upsertReleaseAssetSnapshots(repo.id, today, releases)

    await markItemSuccess(item)
  } catch (err) {
    await markItemFailed(item, normalizeGitHubError(err))
  }
}
```

## Permission fallback

如果 traffic endpoints 返回 403：

- 不要让整个仓库同步失败。
- 将对应 step 标记为 `forbidden`。
- 继续采集 metadata 和 releases。
- UI 上显示 warning：`Traffic unavailable`。

如果 releases 返回 404/empty：

- 记录 no releases。
- 不算错误。

## Traffic upsert 规则

GitHub 返回最近 14 天数组：

```json
{
  "count": 173,
  "uniques": 128,
  "views": [
    { "timestamp": "2026-07-01T00:00:00Z", "count": 10, "uniques": 8 }
  ]
}
```

写入 `traffic_daily`：

- `date = timestamp.slice(0, 10)`。
- views endpoint 写 views/uniqueVisitors。
- clones endpoint 写 clones/uniqueCloners。
- 同一 row 需要 merge，不要互相覆盖。

## Release upsert 规则

采集所有 releases：

```text
GET /repos/{owner}/{repo}/releases?per_page=100&page=N
```

对于每个 release：

- upsert releases。
- 遍历 assets。
- upsert release_assets。
- upsert release_asset_snapshots(assetId, today, download_count)。

如果同一天重复同步，覆盖当天 snapshot 或保持相同值。

## Daily delta 计算

不要在采集时强行计算并存储所有 delta。service 层查询时计算更灵活。

示例：

```ts
const today = await getAssetSnapshot(assetId, date)
const yesterday = await getAssetSnapshot(assetId, previousDate(date))
const delta = today.downloadCount - (yesterday?.downloadCount ?? today.downloadCount)
```

如果没有昨天数据，delta 显示为 `—`，不要显示 0。

## 全量同步流程

实现 `syncAllTrackedRepositories(trigger)`：

1. 创建 sync_run。
2. 查询所有 `isTracked=true` 且未 archived/paused 的仓库。
3. 按并发限制同步，默认 concurrency = 2 或 3。
4. 每个仓库失败不影响其他仓库。
5. 完成后更新 sync_run 状态：success / partial_success / failed。
6. 生成每日报告。
7. 运行告警规则。

## Rate limit 策略

- 每次请求后保存 `x-ratelimit-*`。
- 如果 remaining 低于阈值，比如 100，暂停或延迟同步。
- 遇到 403 secondary rate limit，指数退避。
- 不要超过 100 并发请求。
- 默认每个仓库顺序请求，仓库间小并发。

## 手动同步

API：

```text
POST /api/jobs/sync-now
POST /api/repositories/:id/sync
```

需要防重复：如果已有 running sync，同步按钮显示 `Syncing...`，后端返回当前 run。

## 数据完整性说明

UI 和 README 必须明确：

- 部署前的历史 traffic 无法补回。
- Release downloads 可以从当前累计值开始保存，之后计算新增。
- private repo 数据只保存在用户自托管数据库中。
