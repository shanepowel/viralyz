# Viralyz product app (standalone)

Self-contained Express + Vite React app for **app.viralyz.com**.

This folder is **not** part of the root pnpm/turbo workspace. It has its own lockfile and local packages (`@repo/ui`, `@repo/score-engine`).

## Setup

```bash
cd app.viralyz.com
cp ../.env.example .env   # or copy your existing Neon DATABASE_URL
pnpm install
pnpm dev                  # http://localhost:5000
```

## Scripts

| Command | What it does |
|---------|----------------|
| `pnpm dev` | API + Vite client |
| `pnpm build` | Client + server bundle → `dist/` |
| `pnpm start` | Run production `dist/index.cjs` |
| `pnpm check` | TypeScript |
| `pnpm db:push` | Drizzle push |

## Layout

```
app.viralyz.com/
  client/          React UI (Signal warm-paper skin)
  server/          Express API
  shared/          Drizzle schema + shared types
  packages/ui      Vendored Signal UI (rings, panels, fix cards)
  packages/score-engine
```

## Deploy

Point a Vercel/Node host at this directory as the project root (not the monorepo root). Set `DATABASE_URL` and other secrets on that project.

Marketing site remains at `apps/web` (viralyz.com).
