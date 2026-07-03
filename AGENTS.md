# AGENTS.md

## Cursor Cloud specific instructions

Viralyz is a pnpm + Turborepo monorepo (Node 20+, pnpm 9). Two runnable apps:

| App | Port | Stack | Run (dev) |
|-----|------|-------|-----------|
| `apps/app` | 5000 | Express API + React/Vite, Postgres via **Drizzle** | `pnpm --filter app dev` |
| `apps/web` | 3000 | Next.js 16 marketing site | `pnpm --filter web dev` |

Dependencies are installed automatically by the startup update script (`pnpm install`).
Standard commands live in the root `README.md` / `package.json` scripts. Lint = `pnpm lint`,
type-check = `pnpm check-types` (plus `pnpm --filter app check` for `apps/app`, which uses a
`check` script), build = `pnpm build`, Drizzle schema push = `pnpm db:push`.

### Startup (do this each session — not part of the update script)

1. **Start PostgreSQL** (installed in the VM, but not auto-started):
   `sudo pg_ctlcluster 16 main start`
   A local role/db already exist: role `user` / password `password` / database `viralyz`
   (superuser). If the cluster/data was reset, recreate with:
   `sudo -u postgres psql -c "CREATE ROLE \"user\" WITH LOGIN PASSWORD 'password' CREATEDB SUPERUSER;" -c "CREATE DATABASE viralyz OWNER \"user\";"`
2. **Env vars are NOT auto-loaded.** `apps/app` has no dotenv loader, so you must export the
   env before running anything that needs it (dev server, `db:push`):
   `set -a && source apps/app/.env && set +a`
   `apps/app/.env` is git-ignored and holds local dev values (DATABASE_URL, SESSION_SECRET,
   `AUTH_MODE=dev`, placeholder `OPENAI_API_KEY`, etc.). If it is missing, copy `.env.example` to
   `apps/app/.env` and set `DATABASE_URL=postgresql://user:password@localhost:5432/viralyz?sslmode=disable`.
3. **Create/refresh the schema** (idempotent): `pnpm db:push`
4. **Run the app**: `pnpm --filter app dev` (serves API + UI on :5000).
   Log in as the demo user by visiting `http://localhost:5000/api/login` (dev auth auto-creates
   `creator@viralyz.local` with 500 credits — no real credentials needed).

### Non-obvious gotchas

- **Turborepo strict env mode filters env vars.** Running `pnpm dev` / `pnpm dev:app` (which go
  through `turbo`) will NOT pass `DATABASE_URL` etc. to the task and you'll get
  `Error: DATABASE_URL must be set`. Run per-app with `pnpm --filter app dev` (bypasses turbo), or
  use `pnpm exec turbo run dev --filter=app --env-mode=loose` after exporting the env.
- **An OpenAI key is required just to boot `apps/app`.** `server/lib/openai.ts` throws at import
  time if neither `OPENAI_API_KEY` nor `AI_INTEGRATIONS_OPENAI_API_KEY` is set. A placeholder is
  set in `apps/app/.env` so the server starts; AI-backed tools (Analyze, Hook Lab, Caption Studio,
  Ideas, Thumbnails, Repurpose) will return errors/401 until a real key is provided (set a real
  `OPENAI_API_KEY` secret / edit `apps/app/.env`). Non-AI features (auth, dashboard, content
  library, swipe file, community, calendar) work without a key.
- `packages/database` is a Prisma package that is **not consumed by either app** — `apps/app` uses
  Drizzle (`apps/app/shared/schema.ts` is the DB source of truth). Don't confuse the two when
  changing the app schema.
- PayPal/SendGrid/social-OAuth integrations are optional and log "not configured" warnings on boot;
  this is expected in dev.
