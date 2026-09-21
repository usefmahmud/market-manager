# Client-Side UI Design Spec

**Date:** 2026-09-21
**Status:** Approved
**Scope:** Full client-side UI for market-manager (11 modules)

## Overview

Build the complete client-side UI for a single-supermarket stock management app. The backend (API endpoints, database schema, auth) is already complete. This spec covers all pages, components, routing, and data flow.

## Tech Stack (Frontend)

| Concern | Choice |
|---------|--------|
| Routing | TanStack Router (file-based) |
| Data fetching | TanStack Query + Server Functions |
| Data tables | TanStack Table |
| UI components | shadcn/ui (new-york style) |
| Styling | Tailwind CSS v4 with custom theme |
| Icons | lucide-react |
| Forms | react-hook-form + zod validation |
| Package manager | Bun |

## Route Architecture

```
src/routes/
├── __root.tsx                          # Root shell (html, providers)
├── _authenticated.tsx                   # Layout route: sidebar + auth guard
│   ├── index.tsx                        # / → Dashboard
│   ├── products/
│   │   ├── index.tsx                    # /products (list)
│   │   ├── create.tsx                   # /products/create
│   │   └── $productId.edit.tsx          # /products/:id/edit
│   ├── categories/
│   │   ├── index.tsx                    # /categories (list)
│   │   └── create.tsx                   # /categories/create
│   ├── stock/
│   │   └── index.tsx                    # /stock (levels + history)
│   ├── suppliers/
│   │   ├── index.tsx                    # /suppliers (list)
│   │   └── create.tsx                   # /suppliers/create
│   ├── invoices/
│   │   ├── index.tsx                    # /invoices (list)
│   │   └── $invoiceId.tsx              # /invoices/:id (detail)
│   ├── analytics/
│   │   └── index.tsx                    # /analytics
│   └── settings/
│       ├── index.tsx                    # /settings (store config)
│       └── users.tsx                    # /settings/users (user management)
├── login.tsx                            # /login (no sidebar)
└── checkout.tsx                         # /checkout (full-screen, no sidebar)
```

**Key decisions:**
- `_authenticated.tsx` is a TanStack layout route — wraps all protected pages with sidebar and auth check
- `login` and `checkout` are outside the authenticated group — they get their own layouts
- POS terminal (`checkout.tsx`) is full-screen with no app shell
- No public registration — admin creates users from Settings → Users

## Auth Flow

- Login server function returns `{ token, user }`
- Token stored in httpOnly cookie via `setSessionCookie` server function
- `_authenticated.tsx` calls `meFn` on load — if no valid session, redirect to `/login`
- `useAuth()` hook provides `{ user, isLoading, logout }` to all authenticated pages
- `logout` clears cookie and redirects to `/login`
- Role-based access: Settings/Users and Analytics are admin-only

## App Shell (Sidebar)

Using shadcn Sidebar component (`SidebarProvider`, `Sidebar`, `SidebarContent`, `SidebarMenu`, etc.)

**Sidebar layout:**
```
┌─────────────────────────────────┐
│  Logo / Store Name              │
├─────────────────────────────────┤
│  🏠 Dashboard                   │
│  📦 Products                    │
│  📂 Categories                  │
│  📊 Stock                       │
│  🏭 Suppliers                   │
│  🧾 Invoices                    │
│  💳 Checkout                    │
├─────────────────────────────────┤
│  📈 Analytics          [admin]  │
│  ⚙️  Settings                   │
├─────────────────────────────────┤
│  User avatar + name             │
│  Role badge (admin/cashier)     │
│  Logout button                  │
└─────────────────────────────────┘
```

**Features:**
- Collapsible (icon-only mode on narrow screens)
- Active route highlighted
- User section at bottom with avatar, name, role, logout
- Admin-only items hidden for cashiers
- Responsive: collapses on small screens

## Feature Module UI Pattern

Every feature module follows this structure:

```
features/<feature>/
├── components/
│   ├── <Feature>Table.tsx       # TanStack Table for list views
│   ├── <Feature>Form.tsx        # Create/edit form (reusable)
│   └── <Feature>Dialog.tsx      # Modal dialog wrapper
├── hooks/
│   └── use<Feature>s.ts         # TanStack Query hooks
├── api.ts                       # Already exists
└── types.ts                     # Already exists
```

**Page pattern:**
```tsx
function FeaturePage() {
  const { data, isLoading } = useQuery(featureQueryOptions)
  
  return (
    <div>
      <PageHeader title="Feature" action={<Link to="/feature/create">Add</Link>} />
      {isLoading ? <Skeleton /> : <FeatureTable data={data} />}
    </div>
  )
}
```

**Form pattern:**
- Uses shadcn `Form`, `Input`, `Select`, `Button`
- Zod validation on client (reuses schemas from `types.ts`)
- Calls server function via `useMutation`
- Redirects on success

**Table pattern:**
- TanStack Table for column definitions, sorting, filtering
- shadcn `Table` for rendering
- Search bar with debounced input
- Pagination (server-side or client-based on data size)

## Checkout (POS) Terminal

Full-screen layout, no sidebar. Designed for fast cashier operation.

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  Barcode Scanner Input [________________] [Scan]             │
├──────────────────────────────────┬───────────────────────────┤
│                                  │  CART                     │
│  Product Grid / Search           │  ┌─────────────────────┐  │
│  ┌─────┐ ┌─────┐ ┌─────┐       │  │ Product    Qty  Price│  │
│  │ P1  │ │ P2  │ │ P3  │       │  │ Item 1     2   $9.98 │  │
│  └─────┘ └─────┘ └─────┘       │  │ Item 2     1   $4.99 │  │
│  ┌─────┐ ┌─────┐ ┌─────┐       │  │ ...                   │  │
│  │ P4  │ │ P5  │ │ P6  │       │  ├─────────────────────┤  │
│  └─────┘ └─────┘ └─────┘       │  │ Subtotal:     $14.97 │  │
│                                  │  │ Tax:           $1.50 │  │
│                                  │  │ TOTAL:        $16.47 │  │
│                                  │  └─────────────────────┘  │
│                                  │  [Cash] [Card] [Mixed]    │
│                                  │  [Complete Sale]          │
├──────────────────────────────────┴───────────────────────────┤
│  Esc: Exit  |  F2: Search  |  F8: Clear Cart                │
└──────────────────────────────────────────────────────────────┘
```

**Key behaviors:**
- Barcode scan: Auto-focus input, scan barcode → add to cart
- Product grid: Click to add, or search by name
- Cart: Editable quantities, remove items, running totals
- Payment: Cash/Card/Mixed → calls `createInvoiceFn` → shows receipt
- Keyboard shortcuts: Esc (exit), F2 (search), F8 (clear cart)
- Receipt: Print dialog or on-screen receipt after sale

## shadcn/ui Components

**Foundation (install first):**
- `button`, `input`, `label`, `card`, `badge`
- `form` (react-hook-form + zod integration)
- `dialog`, `alert-dialog`
- `table` (for data tables)
- `select`, `dropdown-menu`
- `sidebar` (main navigation)
- `skeleton` (loading states)
- `toast` / `sonner` (notifications)

**Feature-specific (install as needed):**
- `tabs` (stock levels vs history)
- `separator`, `scroll-area`
- `avatar` (user section in sidebar)
- `sheet` (mobile sidebar)
- `tooltip` (icon tooltips in collapsed sidebar)
- `popover`, `command` (search command palette — nice to have)
- `calendar`, `date-picker` (invoice date filters)
- `checkbox` (bulk operations)

**Prerequisite:** Fix `components.json` aliases to match project conventions (`src/lib/components/ui/`).

## Build Order

| # | Module | What gets built | Depends on |
|---|--------|----------------|------------|
| 0 | **Setup** | Fix `components.json`, install shadcn foundation, add `zod` to package.json | — |
| 1 | **Auth** | Login page, `useAuth()` hook, cookie management, `_authenticated.tsx` layout route | Setup |
| 2 | **Layout + Sidebar** | App shell with shadcn Sidebar, user section, role-based menu, logout | Auth |
| 3 | **Dashboard** | Stats cards (total products, low stock, today's sales), recent activity | Layout |
| 4 | **Categories** | List page, create/edit form, delete confirmation | Layout |
| 5 | **Products** | List with search/filter, create/edit form, barcode display, image placeholder | Categories |
| 6 | **Suppliers** | List page, create/edit form | Layout |
| 7 | **Stock** | Levels table, receive batch form, adjustment form, history log | Products, Suppliers |
| 8 | **Checkout** | Full-screen POS terminal, cart, payment, receipt | Products |
| 9 | **Invoices** | List with date/user filters, detail view, void action (admin) | Layout |
| 10 | **Settings** | Store info form, user management CRUD (admin) | Auth |
| 11 | **Analytics** | Sales charts, top products, revenue reports | Invoices |

Each module is a separate commit. After each, the app should still work.

## Data Flow

- **Server Functions** (already built) handle all mutations
- **TanStack Query** handles caching, refetching, and optimistic updates
- **Query keys** follow pattern: `['feature', ...params]` (e.g., `['products', { search, categoryId }]`)
- **Mutations** invalidate related queries on success
- **Loading states** use Skeleton components
- **Error states** use toast notifications

## File Conventions

- Route files: `src/routes/` (file-based routing)
- Feature components: `src/features/<feature>/components/`
- Feature hooks: `src/features/<feature>/hooks/`
- Shared components: `src/lib/components/ui/` (shadcn)
- Shared hooks: `src/lib/hooks/`
- Utilities: `src/lib/utils.ts`
- Import alias: `#/` maps to `./src/`
