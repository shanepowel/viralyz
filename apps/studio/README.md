# Viralyz Sanity Studio (standalone)

Runs on port **3333** beside `apps/web` (Next on 3000).

## Setup

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
SANITY_API_READ_TOKEN=...   # viewer token, server only
```

4. CORS: `npx sanity cors add http://localhost:3000 --credentials` and production origin.

5. Seed categories: Teardowns, Pricing, Playbooks, Product news.

6. `pnpm --filter studio dev`

Until project id is set, `viralyz.com/blog` serves the launch placeholder posts.
