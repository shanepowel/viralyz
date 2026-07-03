# Viralyz - Handoff & Setup Guide

This package contains the full Viralyz source code, ready to run outside Replit
(for example, editing in Cursor and hosting the database on Neon).

## What Viralyz is

Two products in one codebase:

1. **Viralyz Signal** - B2B competitive content intelligence. Weekly per
   competitor digests (themes, amplifiers, qualified engagement, velocity) plus
   signal correlation that explains WHY a competitor's content shifted (hiring,
   funding, exec podcast appearances).
2. **Viralyz Autopilot** - autonomous AI growth agent that ideates, drafts,
   scores, schedules, posts, and measures content, with a human approval gate.

## Tech stack

- Frontend: React 18 + TypeScript, Vite, Wouter, TanStack Query, Tailwind v4,
  shadcn/ui, Framer Motion
- Backend: Express + TypeScript (Node), RESTful `/api/*`
- Database: PostgreSQL via Drizzle ORM (schema in `shared/schema.ts`)
- AI: OpenAI (gpt-4o for text, gpt-image-1 for vision)

## Project layout

```
client/     React frontend
server/     Express backend, AI tools, integrations, intelligence adapters
shared/     Shared types and Drizzle schema (single source of truth)
scripts/    Build / post-merge helpers
migrations/ Drizzle output (schema is applied with drizzle-kit push)
```

## Quick start (local / Cursor)

1. Install Node 20+ and run:
   ```bash
   npm install
   ```
2. Copy the env template and fill it in:
   ```bash
   cp .env.example .env
   ```
   At minimum set `DATABASE_URL`, `SESSION_SECRET`, and the OpenAI keys. See the
   "Environment variables" section below.
3. Create the database schema (no migration files needed, Drizzle pushes the
   schema directly):
   ```bash
   npm run db:push
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
   The app serves on `http://localhost:5000`.

Production build:
```bash
npm run build   # outputs dist/index.cjs
npm start
```

## Database on Neon

This app uses the standard `node-postgres` driver, so Neon works with no code
changes. Steps:

1. Create a Neon project and copy the pooled connection string.
2. Set it as `DATABASE_URL` (keep `?sslmode=require`).
3. Run `npm run db:push` to create all tables.

The intelligence feature adds these tables (all prefixed `intel`):
`intelCompetitors`, `intelCompetitorPosts`, `intelCompetitorDigests`,
`intelHiringSignals`, `intelFundingSignals`, `intelPodcastSignals`,
`intelSignalCorrelations`.

## Environment variables

See `.env.example` for the full annotated list. Grouped by need:

- **Required:** `DATABASE_URL`, `SESSION_SECRET`, `AI_INTEGRATIONS_OPENAI_API_KEY`,
  `AI_INTEGRATIONS_OPENAI_BASE_URL`.
- **Email digests:** `SENDGRID_API_KEY`, `EMAIL_FROM`.
- **Autopilot:** `AUTOPILOT_TOKEN_KEY`, `AUTOPILOT_TICK_ADMINS`.
- **Social OAuth (only for platforms you enable):** `LINKEDIN_*`, `X_*`,
  `THREADS_*`, `INSTAGRAM_*`.
- **Payments:** `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`.

## Replit-specific pieces to replace off Replit

These work automatically on Replit but need swapping elsewhere:

1. **Authentication** - the app uses Replit Auth (OIDC via `ISSUER_URL` and
   `REPL_ID`) with Passport in `server/`. Off Replit, point it at your own OIDC
   provider (Auth0, Clerk, Cognito) or replace the auth layer.
2. **Object storage** - uploaded media uses `@replit/object-storage`
   (`PRIVATE_OBJECT_DIR`, `PUBLIC_OBJECT_SEARCH_PATHS`). Off Replit, swap for
   S3, Cloudflare R2, or GCS.
3. **OpenAI** - on Replit the keys come from the AI integration. Off Replit,
   set `AI_INTEGRATIONS_OPENAI_API_KEY` to your own OpenAI key and
   `AI_INTEGRATIONS_OPENAI_BASE_URL` to `https://api.openai.com/v1`.

Everything else (Express, Drizzle, React, the intelligence adapters, PayPal) is
portable as is.

## Using Sanity (optional)

If you want to manage marketing or editorial content in Sanity, treat it as an
external content source: create your Sanity project, then add a small adapter in
`server/` that fetches published documents and feeds them into the relevant
pages. Nothing in the current codebase depends on Sanity, so this is additive.

## Not included in this package

To keep the archive small and safe, these are excluded:

- `node_modules/` - run `npm install` to restore
- `.git/`, `.cache/`, `.config/`, `.upm/`, `.local/`, `dist/` - build/tooling
- `.env` and any real secrets - use `.env.example` as the template
