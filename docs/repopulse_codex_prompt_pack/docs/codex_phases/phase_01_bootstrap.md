# Phase 01：项目初始化与基础骨架

## 给 Codex 的阶段提示词

请初始化 RepoPulse 项目骨架。

必须完成：

1. Next.js App Router + TypeScript 项目。
2. Tailwind CSS + shadcn/ui 基础。
3. AppShell、Sidebar、TopBar 布局。
4. 路由：/setup、/overview、/repositories、/releases、/reports、/settings。
5. MySQL 初始化。
6. 基础数据库 schema 和 migration。
7. Demo seed 数据。
8. Dockerfile、docker-compose.yml、.env.example。
9. README 初版。

## 页面占位

每个页面先实现静态 UI，使用 demo 数据：

- Setup
- Overview
- Repositories
- Repository Detail
- Releases
- Reports
- Settings

## 验收

- `pnpm dev` 可运行。
- `pnpm build` 通过。
- `pnpm seed:demo` 生成演示数据。
- 页面视觉接近 UI reference。
- 没有真实 GitHub Token 时也能预览。
