# Backend 04：测试与质量

## 测试目标

第一版至少覆盖：

- 数据采集函数。
- delta 计算。
- report 生成。
- API 输入校验。
- UI smoke tests。

## 推荐工具

- Vitest。
- Testing Library。
- Playwright 可选。
- MSW 或自定义 mock GitHub API。

## 单元测试

重点测试：

```text
calculateDelta
calculateGrowthRate
mergeTrafficViewsAndClones
normalizeGitHubError
ruleBasedSummary
encrypt/decrypt secret
```

## 集成测试

用 mock GitHub API 响应测试：

1. Token verify。
2. Discover repos。
3. Sync one repo。
4. Sync all repos。
5. Generate report。

## UI 测试

基础 smoke：

- Setup 页面能渲染。
- Overview 页面有 KPI。
- Repositories 表格有行。
- Releases 表格有 assets。
- Reports 页面有 summary。

## Demo Data

实现 `pnpm seed:demo`：

生成 6 个仓库、90 天趋势、几个 releases/assets、报告数据。

这样开发时不需要真实 GitHub Token。

## Lint / Format

配置：

- ESLint。
- Prettier。
- TypeScript strict。

CI：

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Acceptance Criteria

- `pnpm test` 通过。
- `pnpm build` 通过。
- Demo mode 能打开所有核心页面。
- 采集函数能处理 403/404/rate limit。
