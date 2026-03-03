# App (Next.js)

Main BI application: dashboards, data pipelines, workspace.

## Setup

```bash
bun install
```

Configure environment (`.env.local` or Vercel): Supabase and API URL as needed.

## Start

```bash
# Development (port 3000)
bun run dev

# Production
bun run build
bun run start
```

## Scripts

- `dev` — Next.js dev server
- `build` — Production build
- `start` — Production server
- `lint`, `format` — Biome
