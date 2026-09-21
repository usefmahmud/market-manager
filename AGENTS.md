# AGENTS.md — Market Manager Technical Reference

Single-supermarket stock management app. Not multi-tenant.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start (React SSR) |
| Routing | TanStack Router (file-based) |
| Data fetching | TanStack Query + Server Functions |
| Data tables | TanStack Table |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Supabase) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Linting | Biome |
| Package manager | Bun |

## Architecture Principles

1. **Feature-based structure** — code organized by business domain, not file type.
2. **Colocation** — feature-specific components, hooks, types, and API live together.
3. **Shared code in `lib/`** — only truly cross-cutting utilities go here.
4. **Server-first** — use Server Functions for mutations; TanStack Query for reads.
5. **Type safety end-to-end** — Drizzle inferred types flow through to components.

## Directory Structure

```
src/
├── db/                     # Database layer
│   ├── index.ts            # Drizzle client + connection
│   └── schema/             # Drizzle schema files (one per entity)
│       ├── products.ts
│       ├── categories.ts
│       ├── stock.ts
│       ├── invoices.ts
│       └── index.ts        # Re-exports all schemas
│
├── features/               # Feature modules (business logic)
│   ├── products/
│   │   ├── components/     # Product-specific UI
│   │   ├── hooks/          # Product-specific hooks
│   │   ├── api.ts          # Server functions + query helpers
│   │   └── types.ts        # Product TypeScript types
│   ├── categories/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── stock/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── checkout/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── invoices/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── analytics/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   └── types.ts
│   └── settings/
│       ├── components/
│       ├── hooks/
│       ├── api.ts
│       └── types.ts
│
├── integrations/           # Third-party integrations (unchanged)
│   └── tanstack-query/
│
├── lib/                    # Shared utilities + UI
│   ├── utils.ts            # cn(), format helpers, etc.
│   ├── hooks/              # Shared hooks (useDebounce, etc.)
│   └── components/         # Shared/reusable UI components
│
├── routes/                 # TanStack Router file-based routes
│   ├── __root.tsx          # Root layout
│   ├── index.tsx           # Dashboard home
│   ├── products/           # Product management pages
│   ├── categories/         # Category management pages
│   ├── stock/              # Stock management pages
│   ├── checkout/           # POS terminal
│   ├── invoices/           # Invoice history + detail
│   ├── analytics/          # Reports + charts
│   └── settings/           # App settings
│
├── router.tsx
├── routeTree.gen.ts        # Auto-generated (never edit)
└── styles.css
```

## Feature Module Anatomy

Every feature follows this structure:

```
features/products/
├── components/         # UI components used only by this feature
│   ├── ProductTable.tsx
│   ├── ProductForm.tsx
│   └── ProductDialog.tsx
├── hooks/              # Feature-specific hooks
│   ├── useProducts.ts
│   └── useProductSearch.ts
├── api.ts              # Server functions + query/mutation helpers
│   # export getProducts, createProduct, updateProduct, deleteProduct
│   # export queryOptions for TanStack Query
└── types.ts            # TypeScript types/interfaces
    # export Product, ProductInsert, ProductUpdate
```

### `api.ts` pattern

```typescript
import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { db } from '#/db'
import { products } from '#/db/schema'

// Server function for fetching data
const getProductsFn = createServerFn({ method: 'GET' }).handler(async () => {
  return db.select().from(products)
})

// Query options for TanStack Query
export const productsQueryOptions = queryOptions({
  queryKey: ['products'],
  queryFn: () => getProductsFn(),
})

// Server function for mutations
export const createProductFn = createServerFn({ method: 'POST' })
  .validator((data: ProductInsert) => data)
  .handler(async ({ data }) => {
    return db.insert(products).values(data).returning()
  })
```

## Database Conventions

### Schema files

One file per entity in `src/db/schema/`:

```typescript
// src/db/schema/products.ts
import { pgTable, serial, text, integer, timestamp, decimal } from 'drizzle-orm/pg-core'
import { categories } from './categories'

export const products = pgTable('products', {
  id: serial().primaryKey(),
  name: text().notNull(),
  barcode: text().unique(),
  categoryId: integer('category_id').references(() => categories.id),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  unit: text().default('piece'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
```

### Schema barrel

`src/db/schema/index.ts` re-exports all schemas:

```typescript
export * from './products'
export * from './categories'
export * from './stock'
export * from './invoices'
```

### Migrations

```bash
bun run db:generate    # Generate migration files
bun run db:migrate     # Run migrations
bun run db:push        # Push schema changes directly (dev)
bun run db:studio      # Open Drizzle Studio
```

## Routing Conventions

File-based routing via TanStack Router. Each route file exports a `Route` using `createFileRoute`.

### Route structure

```
routes/
├── __root.tsx                    # Root layout (html, head, body, providers)
├── index.tsx                     # / (dashboard)
├── products/
│   ├── index.tsx                 # /products (list)
│   ├── create.tsx                # /products/create (add form)
│   └── $productId.edit.tsx       # /products/:productId/edit
├── categories/
│   ├── index.tsx
│   └── create.tsx
├── stock/
│   └── index.tsx
├── checkout/
│   └── index.tsx                 # POS terminal (full screen)
├── invoices/
│   ├── index.tsx                 # Invoice list
│   └── $invoiceId.tsx            # Invoice detail/print
├── analytics/
│   └── index.tsx
└── settings/
    └── index.tsx
```

### Route file pattern

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})

function ProductsPage() {
  return (
    // Page content
  )
}
```

### Loaders

Use loaders for server-side data loading:

```tsx
export const Route = createFileRoute('/products')({
  loader: async () => {
    return getProductsFn()
  },
  component: ProductsPage,
})

function ProductsPage() {
  const products = Route.useLoaderData()
  // ...
}
```

## Data Fetching

### TanStack Query setup

QueryClient provider is in `src/integrations/tanstack-query/root-provider.tsx`.

### Querying data

```typescript
import { useQuery } from '@tanstack/react-query'
import { productsQueryOptions } from '#/features/products/api'

function ProductList() {
  const { data: products, isLoading } = useQuery(productsQueryOptions)
  // ...
}
```

### Mutations

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProductFn } from '#/features/products/api'

function CreateProduct() {
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: createProductFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  return mutation.mutate({ name: 'Widget', price: '9.99' })
}
```

## UI Conventions

### shadcn/ui

Install components as needed:

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add table
```

Component files go in `src/lib/components/ui/`.

### Component patterns

- Use `cn()` from `lib/utils.ts` for class merging
- Use `class-variance-authority` for variant props
- Compose with Radix UI primitives (shadcn handles this)
- Keep components small and focused

### Layout

Root layout in `src/routes/__root.tsx` provides:
- HTML shell
- Global styles
- TanStack Query provider
- Dev tools (dev only)

Feature-specific layouts go in route `layout` files.

## Coding Standards

### Biome

```bash
bun run lint       # Check for issues
bun run format     # Auto-format
bun run check      # Lint + format
```

### TypeScript

- Strict mode enabled
- **Never use `any` type** — use `unknown`, generics, or proper types instead
- Use inferred types from Drizzle schemas
- Prefer `interface` for object shapes
- Export types from `types.ts` files

### Naming

- Files: `PascalCase.tsx` for components, `camelCase.ts` for utilities
- Variables/functions: `camelCase`
- Components: `PascalCase`
- DB columns: `snake_case` (mapped via Drizzle)

### Imports

Use the `#/` alias for absolute imports:

```typescript
import { db } from '#/db'
import { Button } from '#/lib/components/ui/button'
import { useProducts } from '#/features/products/hooks/useProducts'
```

## Development Workflow

### Adding a feature

1. Create DB schema in `src/db/schema/<entity>.ts`
2. Export from `src/db/schema/index.ts`
3. Generate migration: `bun run db:generate`
4. Create feature directory: `src/features/<feature>/`
5. Add `types.ts`, `api.ts`, `hooks/`, `components/`
6. Create routes in `src/routes/<feature>/`
7. Test queries and mutations

### Adding a page

1. Create route file in `src/routes/<path>/index.tsx`
2. Export `Route` with `createFileRoute`
3. Add component function
4. Add loader if data is needed
5. Link from other pages using `<Link to="/path">`

### Adding a shadcn component

```bash
pnpm dlx shadcn@latest add <component>
```

Component lands in `src/lib/components/ui/`. Import from there.

## Environment Variables

`.env.local`:

```
DATABASE_URL=postgresql://...
```

- `DATABASE_URL` — Supabase PostgreSQL connection string
- `VITE_` prefix for client-exposed vars (avoid for secrets)
