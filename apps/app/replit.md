# Viralyz - AI Co-pilot for Pre-Publish Content

## Overview

Viralyz offers two main products:
1.  **Viralyz Signal**: A B2B competitive content intelligence platform, providing weekly per-competitor digests of themes, amplifiers, qualified engagement, and content velocity.
2.  **Viralyz Autopilot**: An autonomous AI growth agent for creators and individual operators, focusing on a "set a mission" approach where the agent ideates, drafts, scores, schedules, posts, and measures content performance, currently with a LinkedIn MVP. It includes a human approval gate before publishing and a global kill switch. The previous suite of tools (Hook Lab, Caption Studio, Idea Generator, Trend Radar, Thumbnail Studio, Brand Voice, Calendar, Repurpose, Swipe File, Analytics) is now integrated as "Manual mode" within the Autopilot framework.

The project aims to provide comprehensive tools for content creation, analysis, and strategic competitive intelligence, streamlining workflows for both businesses and individual creators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
-   **Framework**: React 18 with TypeScript
-   **Routing**: Wouter
-   **State Management**: TanStack React Query
-   **Styling**: Tailwind CSS v4 with custom CSS variables
-   **UI Components**: shadcn/ui library built on Radix UI primitives
-   **Animations**: Framer Motion
-   **Build Tool**: Vite

### Backend Architecture
-   **Framework**: Express.js with TypeScript
-   **Server**: Node.js
-   **Authentication**: Replit Auth using OpenID Connect (OIDC) with Passport.js
-   **Session Management**: PostgreSQL-backed sessions via `connect-pg-simple`
-   **API Design**: RESTful endpoints under `/api/*`

### Data Storage
-   **Database**: PostgreSQL
-   **ORM**: Drizzle ORM
-   **Schema Definition**: `shared/schema.ts`
-   **Migrations**: Drizzle Kit

### Viralyz Signal: Competitor Content Pulse (Module 1 of three)
The Signal product ships in three modules. **Module 1 (Pulse)** is live at `/intelligence`: per tracked competitor, a weekly digest of themes pushed, top amplifiers, qualified engagement (replies from buyer-shaped accounts), and velocity vs the trailing four-week average. **Module 2 (Signal Correlation)** is live on the competitor detail page: it cross-references external signals (new hires, funding, exec podcast appearances) against recent Pulse themes to explain WHY a competitor's content shifted. Module 3 (Strategic Briefs) is planned next.

**Module 2 detail:**
- **Schema** (`shared/schema.ts`): `intelHiringSignals` (unique `competitorId+source+externalId`; `isGtmRole` flag), `intelFundingSignals` (unique `competitorId+externalId`), `intelPodcastSignals` (unique `competitorId+externalId`), `intelSignalCorrelations` (regenerated wholesale per competitor, no unique index). `intelCompetitors` gained `jobBoardUrl`, `fundingRssUrl`, `execNames` (text array) as optional source hints.
- **Adapters** (`server/intelligence/`): `hiring.ts` (Greenhouse/Lever/Ashby public job-board APIs, auto-detects provider from URL, regex-flags GTM/marketing roles), `funding.ts` (reuses the dependency-free `rss.ts` parser over a funding/news RSS feed, keeps only funding-shaped items, extracts a `$X` amount), `podcasts.ts` (public iTunes Search API episode entity by exec name, no auth). All degrade silently to `[]`.
- **Correlation engine** (`correlate.ts`): `correlateSignals(competitorId)` gathers signals detected in the last 4 weeks + the last 4 weekly digests' theme titles, asks `gpt-4o` once for conservative high-confidence correlations, clears prior rows and re-inserts. Runs automatically inside `refreshAndDigest` (after the digest exists) and via the manual signal-refresh route.
- **Ingestion**: `refreshSignals(c)` in `server/intelligence/index.ts` upserts all three signal types; it is called inside `refreshCompetitor`, so the existing "Refresh now" button and the weekly scheduler also pick up signals.
- **Routes** (`server/intelligence-routes.ts`): `GET /:id/signals` returns `{hiring, funding, podcasts, correlations}`; `POST /:id/signals/refresh` re-ingests + re-correlates. The general `PATCH /:id` now also edits `jobBoardUrl`/`fundingRssUrl`/`execNames`, and create accepts them.
- **UI**: "Why now? Correlated signals" section on `/intelligence/:id` (cream/persimmon card) shows gpt-4o correlations with a confidence badge + related theme chips, plus a three-column raw ledger (Hiring/Funding/Podcasts) and its own "Refresh signals" button. The add-competitor dialog gained an optional "Signal correlation" block.

- **Schema** (`shared/schema.ts`, prefixed `intel*` to avoid colliding with the legacy `trackedCompetitors` table): `intelCompetitors`, `intelCompetitorPosts` (unique on `competitorId + source + externalId`), `intelCompetitorDigests` (unique on `competitorId + weekStart`).
- **Ingestion adapters** (`server/intelligence/`): `rss.ts` (regex Atom/RSS, no deps), `x-public.ts` (uses the requesting user's connected X token to read public timeline + reply authors as engagers), `linkedin-company.ts` (best-effort, requires `r_organization_social`). All adapters degrade silently to `[]` and never throw.
- **Qualification** (`qualify.ts`): deterministic regex first, ambiguous titles batched once to `gpt-4o-mini`, cached process-locally.
- **Digest synthesis** (`digest.ts`): `generateWeeklyDigest(competitorId, weekStart?)` calls `gpt-4o` for top-3 themes + top-3 amplifiers, computes qualified vs raw engagement + velocity, persists per-post qualified counts back onto post rows, and upserts via `onConflictDoUpdate`.
- **Routes** (`server/intelligence-routes.ts`): all gated by `requireIntelligencePlan`. `GET / POST /api/intelligence/competitors`, `GET /:id`, `GET /:id/digest?week=`, `POST /:id/refresh`, dedicated `PATCH /:id/notifications`, `PATCH /:id`, `DELETE /:id`. Plan caps: free/pro=1, signal/team=5.
- **Scheduler** (`server/scheduler.ts`): hourly tick that fires Mon 08:00 UTC, refreshes every competitor and emails opt-in users via `renderCompetitorDigestEmail`.
- **UI**: `/intelligence` index (cream/persimmon Cadence palette) shows per-competitor cards with top 3 themes + top 3 amplifiers + velocity. `/intelligence/:id` detail page has hero stats, week selector to drill into prior digests, themes, amplifiers, per-post qualified-engagement breakdown with buyer-shaped engagers list, refresh, email opt-in, delete. Sidebar group "Competitive Intelligence" with Pulse (NEW). Dashboard mini-card surfaces signal counts.

### Key Features and Implementations
-   **Autopilot Architecture**: Manages content lifecycle from ideation to publishing and learning across platforms (LinkedIn, X, Threads, Instagram). It includes an agent runtime (`server/agent.ts`) for drafting, approving, publishing, and measuring content, with platform-specific integrations (`server/integrations/`).
-   **Viralyz Signal Module (Pulse)**: Implemented with dedicated tables for competitors, posts, and digests. It includes ingestion adapters for RSS, X, and LinkedIn, a qualification process for engagers, and a digest synthesis mechanism using `gpt-4o` for themes and amplifiers. A scheduler (`server/scheduler.ts`) handles hourly ticks for competitor refreshes and weekly digest emails.
-   **Content Analysis and Generation**: AI-powered tools for pre-publish analysis, hook generation, caption rewriting, trend detection, idea generation, and thumbnail creation. `gpt-4o` is used for various content tasks, and `gpt-image-1` for vision-related tasks.
-   **Brand Voice Integration**: Users can define brand voice profiles (tone, vocabulary, rules) which are integrated into AI content generation prompts.
-   **Authentication Flow**: OIDC-based authentication via Replit Auth, with user data synchronization and session management in PostgreSQL.
-   **Design System**: Features a consistent UI/UX with custom design tokens, reusable components (e.g., `ScoreRing`, `PageHeader`, `EmptyState`), and a cohesive visual language across all tools.
-   **UI Redesign (Autopilot-first)**: Reorganized sidebar, a new "Mission Control" dashboard, a dedicated `/autopilot` section for mission management, and a rewritten landing page emphasizing the autonomous agent.
-   **Code Organization**: Structured into `client/` (React frontend), `server/` (Express backend, AI tools, integrations), `shared/` (shared types and schema), and `migrations/`.

### Core API Endpoints
-   `/api/intelligence/*`: For competitive intelligence management.
-   `/api/linkedin/*`, `/api/missions/*`, `/api/runs/*`, `/api/autopilot/*`: For Autopilot functionality and platform integrations.
-   `/api/notifications`, `/api/onboarding`, `/api/calendar`, `/api/brand-voice`, `/api/thumbnails`, `/api/search`: General application features.
-   `/api/content/board`: For content pipeline management.
-   `/api/swipe-file/*`: For managing curated and user-saved content.
-   `/api/repurpose`: For repurposing content across platforms.

## External Dependencies

### Database
-   **PostgreSQL**: Primary data store.
-   **Drizzle ORM**: Used for database interactions.

### Authentication
-   **Replit Auth**: OIDC provider for user authentication.
-   **Passport.js**: Authentication middleware.
-   **express-session**: Session management.

### Frontend Libraries
-   **@tanstack/react-query**: Asynchronous state management.
-   **framer-motion**: UI animations.
-   **wouter**: Client-side routing.
-   **lucide-react**: Icon library.

### UI Framework
-   **Radix UI**: Foundational accessible UI components.
-   **class-variance-authority**: Component variant utility.
-   **tailwind-merge**: Tailwind CSS class utility.

### AI Models
-   **gpt-4o**: Used for content generation, analysis, and digest synthesis.
-   **gpt-image-1**: Used for AI vision tasks like brand voice extraction and thumbnail rendering.

### Platform Integrations
-   **LinkedIn API**: For posting and fetching stats.
-   **X API**: For posting and fetching stats.
-   **Meta Threads API**: For posting and insights.
-   **Instagram Graph API**: For posting (requires media).

### Payment Gateway
-   **PayPal**: For subscription management.

### Replit Integrations
-   `@replit/repl-auth`: For Replit authentication.
-   `@replit/object-storage`: For object storage.
-   `@replit/image`: For image processing.
-   `@replit/paypal`: For PayPal integration.