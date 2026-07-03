# Viralyz

All-in-one AI toolkit for short-form creators — rebuilt for production outside Replit.

## Architecture

| App | Port | Purpose |
|-----|------|---------|
| `apps/app` | 5000 | Full Viralyz product (Express API + React UI) |
| `apps/web` | 3000 | Marketing site (Next.js) |

```
viralyz/
├── apps/
│   ├── app/          # Main product (from Replit source)
│   │   ├── client/   # React + Vite frontend
│   │   ├── server/   # Express API, AI tools, autopilot, intelligence
│   │   └── shared/   # Drizzle schema (single source of truth)
│   └── web/          # Next.js marketing landing
├── packages/
│   └── config/       # Shared constants
└── turbo.json
```

## Features

### Creator tools (all API-backed)
- **Analyze** — viral content scoring with file upload
- **Hook Lab** — AI hook generation
- **Caption Studio** — platform-native caption rewriting
- **Ideas** — content idea generator
- **Thumbnails** — AI thumbnail concepts + rendering
- **Trends** — niche trend radar
- **Swipe File** — searchable inspiration library
- **Repurpose** — cross-platform content variants
- **Brand Voice** — tone extraction and injection
- **Calendar & Content Library** — kanban + scheduling
- **Analytics** — real stats from your analyses
- **Insights** — best-time-to-post heatmap

### Platform features
- **Autopilot** — autonomous content agent with approval gates
- **Intelligence** — competitor tracking, digests, signal correlation
- **Community** — creators, follows, DMs
- **PayPal billing** — subscription upgrades

## Database (Neon)

Viralyz uses PostgreSQL via Drizzle ORM. **Neon** is the recommended host.

| Setting | Value |
|---------|-------|
| Project | `viralyz` |
| Project ID | `wispy-firefly-07574961` |
| Database | `neondb` |
| Region | `us-west-2` |

1. Open [Neon Console](https://console.neon.tech) → project **viralyz**
2. Copy the **pooled** connection string (must include `?sslmode=require`)
3. Set `DATABASE_URL` in `apps/app/.env`
4. Push schema: `pnpm db:push`

Schema is already applied on the main branch. For fresh environments, run `pnpm db:push` after setting `DATABASE_URL`.

## Quick start

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example apps/app/.env
# Edit apps/app/.env — set DATABASE_URL, SESSION_SECRET, OPENAI_API_KEY

# Create database schema
pnpm db:push

# Start everything (app on :5000, marketing on :3000)
pnpm dev
```

- **App:** http://localhost:5000
- **Marketing:** http://localhost:3000
- **Login (dev mode):** http://localhost:5000/api/login

Dev auth auto-creates a demo user with 500 credits. No Replit required.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start app + marketing site |
| `pnpm dev:app` | Start Viralyz app only |
| `pnpm dev:web` | Start marketing site only |
| `pnpm db:push` | Push Drizzle schema to Postgres |
| `pnpm build` | Build all apps |

## Off-Replit changes

| Replit feature | Replacement |
|----------------|-------------|
| Replit Auth | Dev session auth (`AUTH_MODE=dev`) — swap for Clerk later |
| AI Integrations | Direct OpenAI API (`OPENAI_API_KEY`) |
| Object Storage | Local filesystem (`USE_LOCAL_STORAGE=true`) |

See `apps/app/HANDOFF.md` for the original migration guide.

## Deployment

### Marketing site (Vercel)

The Next.js marketing site (`apps/web`) deploys to Vercel.

| Setting | Value |
|---------|-------|
| Project | `viralyz` |
| Team | `shanerad1s-projects` |
| Root directory | `apps/web` |
| Framework | Next.js |

**Vercel project settings**

1. Connect the GitHub repo `shanepowel/viralyz`
2. Set **Root Directory** to `apps/web` (monorepo)
3. Build/install commands are in `apps/web/vercel.json` (Turbo filter for `web`)

**Environment variables** (Vercel → Project → Settings → Environment Variables)

| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_APP_URL` | Production, Preview | URL of the main Viralyz app (see below) |

Until the Express app is hosted, set `NEXT_PUBLIC_APP_URL` to your local tunnel or future API host.

### Main app (Express + React)

Deploy `apps/app` to Railway, Render, or Fly.io (Node server + Postgres). Required env vars:

- `DATABASE_URL` — Neon pooled connection string
- `SESSION_SECRET` — long random string
- `AUTH_MODE=dev` (or your OIDC provider)
- `OPENAI_API_KEY`
- `APP_URL` — public URL of the deployed app

After the app is live, set `NEXT_PUBLIC_APP_URL` on Vercel to that URL so marketing CTAs link correctly.

## License

Private — all rights reserved.
