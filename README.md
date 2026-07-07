# RepoPulse

RepoPulse is a self-hosted GitHub analytics dashboard for repositories, release downloads, traffic, sync history, and rule-based reports.

## Structure

- `apps/web`: Next.js TypeScript app with Tailwind UI and API routes.
- `apps/worker`: Node.js worker skeleton for scheduled/manual sync jobs.
- `packages/core`: shared contracts, mock data, GitHub collector skeleton, metrics, and reports.
- `packages/db`: MySQL-first schema/migration and client helpers.

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev:web
```

`GITHUB_TOKEN` and `DATABASE_URL` may stay empty/placeholders for UI smoke. The app falls back to mock data when live GitHub or DB configuration is absent.

## Checks

```bash
pnpm check:logic
pnpm typecheck
```

Run `packages/db/src/migrations/0001_initial.sql` against a local MySQL database only after replacing placeholders with local-only credentials.
