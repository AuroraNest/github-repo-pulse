# Phase 02：GitHub 数据采集与快照存储

## 给 Codex 的阶段提示词

在已有 RepoPulse 项目基础上，实现 GitHub 数据采集闭环。

必须完成：

1. GitHub Token 验证。
2. 仓库发现。
3. 选择仓库并保存 tracking 状态。
4. 同步单个仓库 metadata。
5. 同步 traffic views/clones。
6. 同步 popular paths/referrers。
7. 同步 releases/assets/download_count。
8. 写入 snapshots。
9. sync_runs 和 sync_run_items。
10. 手动 sync now。

## 重要要求

- Traffic 403 不要导致整个仓库同步失败。
- Release assets 没有数据时不是错误。
- 同一天重复同步要 upsert。
- 记录 GitHub rate limit。
- 不在日志输出 token。

## 验收

- Setup 可以验证真实 token。
- 可以发现仓库。
- 可以选择仓库开始 tracking。
- 可以手动同步一个仓库。
- 数据库中能看到 snapshots。
- Releases 页面能显示真实 download_count。
