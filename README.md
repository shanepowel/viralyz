# Viralyz

All-in-one AI toolkit for short-form creators. Rebuilt from the ground up on a modern, production-ready stack.

## Features

Viralyz bundles 10 creator tools into one platform:

| Tool | Description |
|------|-------------|
| **Virality Predictor** | Score content ideas before publishing |
| **Script Enhancer** | AI-powered short-form script writing |
| **Competitor Tracker** | Monitor competitor performance |
| **Video Analysis** | Hook, pacing, and structure feedback |
| **Profile Analysis** | Social profile growth audits |
| **SEO / Caption Generator** | Platform-optimized captions & hashtags |
| **Thumbnail Generator** | AI thumbnail creation |
| **Content Planner** | Weekly content calendar |
| **Instagram Auto DM** | Automated lead nurturing |
| **BioStore** | Link-in-bio storefront with analytics |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | [Turborepo](https://turbo.build) + pnpm workspaces |
| Frontend | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Database | [PostgreSQL](https://www.postgresql.org) + [Prisma](https://www.prisma.io) |
| Auth | [Clerk](https://clerk.com) (planned) |
| AI | OpenAI / Anthropic via Vercel AI SDK (planned) |
| Payments | [Stripe](https://stripe.com) (planned) |
| Deployment | [Vercel](https://vercel.com) |

## Project Structure

```
viralyz/
├── apps/
│   └── web/                 # Next.js application (landing + dashboard)
├── packages/
│   ├── config/              # Shared constants (tools, pricing plans)
│   ├── database/            # Prisma schema & client
│   ├── ui/                  # Shared UI components
│   ├── eslint-config/       # Shared ESLint config
│   └── typescript-config/   # Shared TypeScript config
├── turbo.json
├── package.json
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (local, [Neon](https://neon.tech), or [Supabase](https://supabase.com))

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client
pnpm db:generate

# Push schema to database (development)
pnpm db:push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page and [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the app shell.

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Prisma Studio |

## Environment Variables

See [`.env.example`](.env.example) for all required variables. At minimum for local development:

- `DATABASE_URL` — PostgreSQL connection string

## Roadmap

- [x] Monorepo scaffolding & environment setup
- [x] Landing page with pricing
- [x] Dashboard shell with all 10 tools
- [x] Prisma data model
- [ ] Clerk authentication
- [ ] AI tool implementations (Vercel AI SDK)
- [ ] Stripe subscription billing
- [ ] Social platform integrations (Instagram, TikTok)
- [ ] Background jobs for competitor sync (Inngest / Trigger.dev)

## License

Private — all rights reserved.
