# Viralyz Sanity Studio (standalone)

Not part of the root pnpm workspace (keeps Vercel `pnpm install` lean).

Runs on port **3333** beside `apps/web` (Next on 3000).

## Setup

```bash
cd apps/studio
pnpm install
```

1. Create a Sanity project (or reuse an existing one).
2. Set env in `apps/studio/.env`:

```
SANITY_STUDIO_PROJECT_ID=...
SANITY_STUDIO_DATASET=production
```

3. Set matching vars for the Next app in `apps/web/.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=...
```

4. CORS: `npx sanity cors add http://localhost:3000 --credentials`

5. Seed categories: Teardowns, Pricing, Playbooks, Product news.

6. `pnpm dev` inside `apps/studio`

Until project id is set, `/blog` serves launch placeholder posts.
