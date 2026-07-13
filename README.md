# Viralyz

**The creator operating system** — every tool feeds one intelligence layer (Viral Score history) that becomes a verified track record.

## Architecture (v2.0)

| App / Package | Purpose |
|---------------|---------|
| `apps/web` | Marketing + dashboard shell (Next.js, Signal design) — Vercel |
| `apps/app` | Full product (Express API + React) — analyze, tools, intelligence |
| `packages/ui` | **Signal** design system (tokens, ScoreRing, FixCard, …) |
| `packages/db` | Content-graph Drizzle schema (analyses, media kits, marketplace) |
| `packages/config` | Shared positioning, tools, v2 pricing |

```
viralyz/
├── apps/
│   ├── web/                 # Next.js — Signal landing + shell
│   └── app/                 # Express + Vite product
├── packages/
│   ├── ui/                  # Signal design system
│   ├── db/                  # Content graph schema
│   ├── config/              # Constants & pricing
│   └── …
└── scripts/
    └── backfill-content-graph.ts
```

## Signal design system

Dark-first tokens (`#0A0A0F` / accent `#7C5CFF`), Clash Display + Inter + JetBrains Mono.

Signature components in `@repo/ui`:
- **ScoreRing** — brand mark; count-up; glow at 80+
- **FixCard** — actionable suggestion with predicted impact
- **MomentumSparkline** — score trend
- **PlatformChips** — TikTok / YouTube / IG / X

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
# Legacy + product tables
pnpm db:push

# Content-graph tables (packages/db)
DATABASE_URL=… pnpm db:push:graph

# Backfill content_analyses → content_items
DATABASE_URL=… pnpm db:backfill
```

## Quick start

```bash
pnpm install
cp .env.example apps/app/.env
# Set DATABASE_URL, SESSION_SECRET, OPENAI_API_KEY

pnpm db:push
pnpm dev
```

- **Marketing:** http://localhost:3000  
- **App:** http://localhost:5000  
- **Dev login:** http://localhost:5000/api/login  

## Spec roadmap

Phase 1 (this branch): Signal UI package, landing reskin, content-graph schema, app token alignment.  
Later: Inngest analysis pipeline, Creation Suite extensions, BioPage, Media Kit, Marketplace (feature-flagged).

## License

Private — all rights reserved.
