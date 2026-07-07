# 05 - GitHub API 采集器设计

## 采集目标

RepoPulse 要每天采集以下数据：

1. 用户可访问仓库列表
2. 仓库基础信息
3. 仓库每日快照：stars、forks、issues、language、latest release 等
4. Traffic views
5. Traffic clones
6. Popular paths
7. Referrers
8. Releases
9. Release assets
10. Release asset download_count
11. API rate limit 状态

## 采集器文件结构

```text
apps/worker/src/collectors/
  github-client.ts
  repo-list-collector.ts
  repo-metadata-collector.ts
  traffic-collector.ts
  release-collector.ts
  rate-limit.ts
  types.ts
```

或者放到：

```text
packages/core/src/github/
```

worker 调用 core 的 collector。

## GitHub Client

使用 Octokit。

要求：

- 支持 `GITHUB_API_BASE_URL`
- token 从数据库解密得到
- 每次请求处理 rate limit header
- 统一错误类型
- 超时和重试

类型：

```ts
type GitHubClientOptions = {
  token: string
  baseUrl?: string
  userAgent?: string
}
```

## 仓库列表采集

API 逻辑：

- 获取 authenticated user
- 获取用户可访问 repositories
- 支持分页
- 支持 owner / collaborator / organization_member
- 保存到 repositories 表
- 不自动 tracked，除非用户选择 all

伪代码：

```ts
async function collectAccessibleRepositories(connectionId: string) {
  const repos = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
    visibility: 'all',
    affiliation: 'owner,collaborator,organization_member',
    per_page: 100,
    sort: 'updated',
  })

  for (const repo of repos) {
    await upsertRepository(repo)
  }
}
```

## 单仓库同步流程

```ts
async function syncRepository(repoId: string, syncRunId: string) {
  create sync_run_item
  try {
    repo = collectRepoMetadata()
    upsert repository
    create repository_snapshot

    traffic = collectTraffic()
    upsert traffic_daily
    upsert traffic_summary_snapshot
    upsert popular_path_snapshots
    upsert referrer_snapshots

    releases = collectReleases()
    upsert releases
    upsert assets
    upsert asset snapshots

    derive metrics
    create activity events if needed

    mark item success
  } catch error {
    mark item failed
  }
}
```

## Repo metadata collector

需要采集字段：

- github_repo_id
- owner
- name
- full_name
- html_url
- clone_url
- description
- private
- visibility
- default_branch
- language
- license
- archived
- disabled
- fork
- stargazers_count
- forks_count
- watchers_count
- subscribers_count 如果可拿到
- open_issues_count
- size
- network_count 如果可拿到
- pushed_at
- created_at
- updated_at

还可以采集 topics / languages。

## Traffic collector

要采集：

- views summary + daily breakdown
- clones summary + daily breakdown
- popular paths
- referrers

重要：Traffic API 可能返回 403。不要把 repo 同步标记完全失败，可以标记 `collected_repo=true`，`collected_traffic=false`，错误信息写 item。

Traffic 返回 daily 数据时，按 `traffic_date` upsert。

伪代码：

```ts
async function collectViews(repo) {
  const res = await octokit.request('GET /repos/{owner}/{repo}/traffic/views', {
    owner: repo.owner,
    repo: repo.name,
    per: 'day',
  })

  await upsertTrafficSummary(repo.id, today, {
    views_count_14d: res.data.count,
    views_uniques_14d: res.data.uniques,
  })

  for (const item of res.data.views) {
    await upsertTrafficDaily({
      repositoryId: repo.id,
      metric: 'views',
      date: toDate(item.timestamp),
      count: item.count,
      uniques: item.uniques,
      lastSeenSnapshotDate: today,
    })
  }
}
```

clones 同理。

## Popular paths / Referrers

这些是窗口数据，不是单日数据。

保存方式：

- 每天保存一份 snapshot
- 允许同一个 path 在不同 snapshot_date 重复

用途：

- 展示今天窗口内最热页面
- 看 popular path 历史变化
- 估算 release 页面访问占比

## Release collector

采集：

- list releases，分页
- 每个 release 的 assets
- asset download_count
- size
- content_type
- browser_download_url

伪代码：

```ts
async function collectReleases(repo) {
  const releases = await octokit.paginate(octokit.rest.repos.listReleases, {
    owner: repo.owner,
    repo: repo.name,
    per_page: 100,
  })

  for (const release of releases) {
    const dbRelease = await upsertRelease(repo.id, release)
    for (const asset of release.assets ?? []) {
      const dbAsset = await upsertAsset(repo.id, dbRelease.id, asset)
      await upsertAssetSnapshot(dbAsset.id, today, asset.download_count)
    }
  }
}
```

## daily_delta 计算

当保存 asset snapshot 时：

1. 查找该 asset 最近一个早于今天的 snapshot
2. 计算 `delta = today.download_count - previous.download_count`
3. 如果 delta < 0，则设为 0，并记录 anomaly：download_count reset
4. 如果没有 previous，则 delta = 0 或 null。建议第一次同步 delta = 0，避免把历史累计误认为今日新增。

## 同步全部仓库

```ts
async function syncAllRepositories(trigger: 'schedule' | 'manual') {
  const syncRun = await createSyncRun(trigger)
  const repos = await listTrackedRepositories()
  await updateSyncRunTotal(syncRun.id, repos.length)

  await runWithConcurrency(repos, SYNC_CONCURRENCY, async (repo) => {
    await syncRepository(repo.id, syncRun.id)
  })

  await finalizeSyncRun(syncRun.id)
  await generateDailyReportIfNeeded()
}
```

## Rate limit 处理

每次 GitHub API 响应都要读取：

- x-ratelimit-limit
- x-ratelimit-remaining
- x-ratelimit-reset

如果 remaining 太低，比如 < 50：

- 停止新仓库同步
- 当前 sync_run 标记 partial_failed
- UI 显示 rate limit warning

## 并发策略

默认并发 3。

```env
SYNC_CONCURRENCY=3
```

对于个人用户仓库不多，3 足够。组织仓库多可以调高。

## 错误分类

定义：

```ts
type CollectorErrorCode =
  | 'GITHUB_UNAUTHORIZED'
  | 'GITHUB_FORBIDDEN'
  | 'GITHUB_NOT_FOUND'
  | 'GITHUB_RATE_LIMITED'
  | 'GITHUB_TIMEOUT'
  | 'TRAFFIC_PERMISSION_MISSING'
  | 'DB_ERROR'
  | 'UNKNOWN'
```

UI 要能根据 error_code 提示：

- 401：Token 失效，请重新连接
- 403 traffic：Token 缺少 Traffic 权限
- 404：仓库不可访问或已删除
- rate limit：等待 reset 后重试

## Mock mode

为了开发和 demo，建议支持 mock data。

```env
MOCK_GITHUB=false
```

Mock mode 用固定 JSON 生成：

- 18 个仓库
- 30 天趋势
- 几个 release assets
- reports

但生产环境不要默认开 mock。

## Collector 验收标准

- 可以验证 token
- 可以列出仓库
- 可以选择 tracked repo
- 可以同步一个 repo
- 可以同步所有 repo
- 某个 repo 失败不会影响其他 repo
- Traffic 403 有清楚日志
- Release asset download_count 能写入 snapshot
- 第二天 snapshot 能正确计算 daily_delta
- sync_runs 和 sync_run_items 有完整状态
