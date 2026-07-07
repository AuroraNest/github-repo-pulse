# 19 - 测试与验收清单

## 测试范围

至少覆盖：

- GitHub token 验证
- 数据库写入
- release download delta 计算
- traffic daily upsert
- report 生成
- AI fallback
- API auth
- UI 页面基础渲染

## 单元测试

### release delta

场景：

1. 第一次同步 download_count=72，daily_delta=0
2. 第二天 download_count=80，daily_delta=8
3. 第三天 download_count=78，daily_delta=0，并记录 reset warning

### traffic upsert

场景：

1. 第一次同步写入 14 天数据
2. 第二次同步包含重叠日期
3. 同一天数据应该 update，不重复 insert

### report generation

输入指标，输出必须包含：

- summary
- highlights
- anomalies
- markdown

### AI fallback

AI disabled：使用规则 summary。

AI enabled but API error：使用规则 summary，并记录 ai_runs failed。

## API 测试

- 未登录访问 `/api/overview` 返回 401
- 登录后可访问
- `POST /api/setup/verify-token` token 为空返回校验错误
- `GET /api/repositories` 返回分页结构
- `POST /api/sync/run` 创建 sync run
- `POST /api/reports/generate` 创建 report

## UI 验收

### Setup

- 可以输入 token
- 可以 verify
- 可以选择仓库
- 可以 Start Tracking
- 错误状态可见

### Overview

- KPI 正常显示
- 图表有数据
- 无数据时有 empty state

### Repositories

- 表格显示
- 搜索可用
- 筛选可用
- Sync now 可点击

### Repository Detail

- KPI 显示
- traffic chart 显示
- popular paths/referrers 显示
- release assets 显示

### Releases

- asset 表格显示
- total downloads 正确
- today delta 正确

### Reports

- 能生成日报
- 能导出 markdown
- AI 状态显示正确

### Settings

- Token masked
- sync schedule 可保存
- AI 设置可保存
- Delete data 二次确认

## Docker 验收

```bash
cp .env.example .env
docker compose up -d
```

检查：

- web 可访问
- worker 启动无报错
- SQLite volume 创建
- migrate 成功
- health endpoint healthy

## 安全验收

- 日志中没有 token
- 前端响应没有 encrypted_token
- AI prompt 没有 secret
- Delete data 需要确认
- 未登录不能访问 API

## 开源验收

- README 可读
- LICENSE 存在
- `.env.example` 完整
- Docker Compose 可用
- 没有作者个人隐私信息
- 没有硬编码 AuroraNest 或 Modify_Positioning，除非在 mock data 中并注明

## 最终验收场景

完整流程：

1. 启动项目
2. 登录
3. 进入 Setup
4. 填 GitHub Token
5. 验证成功
6. 选择 1-3 个仓库
7. Start Tracking
8. 手动 sync 一次
9. Overview 出现数据
10. Repositories 出现仓库
11. 进入仓库详情
12. Releases 页面看到下载量
13. 生成日报
14. 导出 Markdown
15. Settings 修改同步时间
16. 重启 Docker 后数据仍在
