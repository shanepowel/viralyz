# Viralyz

**The creator operating system** — every tool feeds one intelligence layer (Viral Score history) that becomes a verified track record.

## Architecture (v2.0)

| App / Package | Purpose |
|---------------|---------|
| `apps/web` | Marketing site (Next.js, Signal design) — viralyz.com on Vercel |
| `app.viralyz.com` | **Standalone** product app (Express + React) — analyze, tools, kit |
| `apps/studio` | Sanity Studio (standalone install) |
| `packages/ui` | Signal design system shared with marketing |
| `packages/db` | Content-graph / marketplace Drizzle schema (marketing APIs) |
| `packages/config` | Shared positioning, tools, v2 pricing |

```
viralyz/
├── app.viralyz.com/       # Standalone product (own pnpm lockfile)
│   ├── client/            # React UI
│   ├── server/            # Express API
│   └── packages/          # Vendored ui + score-engine
├── apps/
│   ├── web/               # Next.js marketing
│   └── studio/            # Sanity (optional)
├── packages/
│   ├── ui/                # Signal (marketing)
│   ├── db/                # Marketplace schema
│   └── …
└── scripts/
```

## Product app (app.viralyz.com)

Not part of the root workspace. Install and run from its folder:

```bash
cd app.viralyz.com
cp ../.env.example .env
# Set DATABASE_URL, SESSION_SECRET, OPENAI_API_KEY
pnpm install
pnpm db:push
pnpm dev
```

- **App:** http://localhost:5000  
- **Dev login:** http://localhost:5000/api/login  

From repo root you can also: `pnpm dev:app` / `pnpm build:app` / `pnpm db:push`.

## Marketing site

```bash
pnpm install          # root workspace (web + packages)
pnpm dev:web          # http://localhost:3000
```

## Signal design system

Warm paper tokens (`#FAFAF7` / violet `#6C4CF1`), Bricolage Grotesque + Inter + JetBrains Mono.

Signature components: ScoreRing (34 / 150), FixCard, Panel, StatCard, StatusChip, StickyActionBar.

## Pricing (v2)

| Free | Creator $29 | Studio $79 | Business $199 |
|------|-------------|------------|---------------|
| 10 analyses | Unlimited | Unlimited | Unlimited |
| 3 competitors | 30 / 6h | 100 / 1h | 100 / 1h |

## Database (Neon + Drizzle)

| Setting | Value |
|---------|-------|
| Project | `viralyz` |
| Region | `us-west-2` |

```bash
# Product tables (standalone app)
pnpm db:push

# Marketplace / content-graph (packages/db, used by apps/web)
DATABASE_URL=… pnpm db:push:graph
```
