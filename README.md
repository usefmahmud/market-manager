# Market Manager

A single-supermarket stock management application built with TanStack Start and Drizzle ORM.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start (React SSR) |
| Routing | TanStack Router (file-based) |
| Data fetching | TanStack Query + Server Functions |
| Data tables | TanStack Table |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Supabase) |
| Validation | Zod |
| Auth | Cookie-based sessions (JWT + httpOnly) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Linting | Biome |
| Package manager | Bun |

## Getting Started

```bash
bun install
```

Create a `.env.local` file:

```
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key
```

Then run the dev server:

```bash
bun run dev
```

The app starts at `http://localhost:3400`.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run lint` | Check for lint issues |
| `bun run format` | Auto-format code |
| `bun run check` | Lint + format |
| `bun run db:generate` | Generate Drizzle migration files |
| `bun run db:migrate` | Run database migrations |
| `bun run db:push` | Push schema changes directly (dev) |
| `bun run db:studio` | Open Drizzle Studio |

## Project Structure

```
src/
├── db/              # Drizzle schema + connection
├── features/        # Feature modules (products, stock, checkout, etc.)
├── lib/             # Shared utilities, hooks, and UI components
├── routes/          # TanStack Router file-based routes
└── integrations/    # Third-party integrations (TanStack Query)
```

Each feature module follows a consistent structure:

```
features/<name>/
├── components/   # UI components
├── hooks/        # Custom hooks
├── api.ts        # Server functions + query helpers
└── types.ts      # Zod schemas + TypeScript types
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Supabase) |
| `SESSION_SECRET` | JWT signing secret for sessions |
| `VITE_*` | Client-exposed vars (use prefix for browser-safe values only) |

## Deploying to Vercel

1. Push to GitHub
2. In Vercel, choose **Add New > Project** and import the repo
3. Add environment variables under **Settings > Environment Variables**
4. Deploy

The `vercel.json` handles framework detection automatically.
