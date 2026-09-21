# Client-Side UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete client-side UI for a single-supermarket stock management app — login, dashboard, product/category/supplier/stock management, POS checkout, invoices, settings, and analytics.

**Architecture:** File-based routing with TanStack Router. Auth via httpOnly cookie + layout route guard. Data fetching via TanStack Query hooks calling server functions. UI via shadcn/ui components. Each feature module follows a consistent Table/Form/Dialog pattern.

**Tech Stack:** TanStack Router, TanStack Query, TanStack Table, shadcn/ui, Tailwind CSS v4, lucide-react, react-hook-form, zod, Bun

**Spec:** `docs/superpowers/specs/2026-09-21-client-side-ui-design.md`

## Global Constraints

- Import alias: `#/` maps to `./src/`
- Biome: `indentStyle: "tab"`, `quoteStyle: "double"`
- No `any` types — use `unknown`, generics, or proper types
- Components in `src/lib/components/ui/` (shadcn), feature components in `src/features/<feature>/components/`
- Server functions already exist in `src/features/*/api.ts` — do not modify them
- Zod schemas already exist in `src/features/*/types.ts` — reuse for client validation
- All mutations use `useMutation` + `useQueryClient().invalidateQueries()`
- All queries use `useQuery` with `queryOptions` pattern
- Each module = one git commit

---

## Module 0: Setup

### Task 0.1: Fix components.json and install shadcn foundation

**Files:**
- Modify: `components.json`
- Create: `src/lib/components/ui/` (shadcn will populate)

**Steps:**

- [ ] **Step 1: Update components.json aliases**

The current aliases point to `#/components/ui` but our convention uses `src/lib/components/ui/`. Update:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "#/lib/components",
    "utils": "#/lib/utils",
    "ui": "#/lib/components/ui",
    "lib": "#/lib",
    "hooks": "#/lib/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 2: Install shadcn foundation components**

```bash
cd /Users/usefmahmud/Documents/programming/web/market-manager
bunx shadcn@latest add button input label card badge dialog alert-dialog table select dropdown-menu sidebar skeleton sonner separator scroll-area avatar tooltip
```

- [ ] **Step 3: Add react-hook-form and zod as explicit dependencies**

```bash
bun add react-hook-form @hookform/resolvers zod
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
bun run tsc --noEmit
```

Expected: Clean compilation.

- [ ] **Step 5: Verify biome passes**

```bash
bunx biome check --write
```

Expected: Clean or auto-fixed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: install shadcn foundation components and form dependencies"
```

---

## Module 1: Auth

### Task 1.1: Create useAuth hook and auth context

**Files:**
- Create: `src/lib/hooks/useAuth.ts`
- Create: `src/features/auth/api-client.ts`

**Interfaces:**
- Produces: `useAuth()` returns `{ user: AuthUser | null, isLoading: boolean, logout: () => void }`

**Steps:**

- [ ] **Step 1: Create the auth client helpers**

Create `src/features/auth/api-client.ts`:

```typescript
import { createServerFn } from "@tanstack/react-start";

export const setSessionCookieFn = createServerFn({ method: "POST" })
  .validator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    const { setCookie } = await import("#/lib/auth-utils");
    setCookie("session", data.token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return { success: true };
  });

export const clearSessionCookieFn = createServerFn({ method: "POST" }).handler(
  async () => {
    const { deleteCookie } = await import("#/lib/auth-utils");
    deleteCookie("session", { path: "/" });
    return { success: true };
  },
);
```

- [ ] **Step 2: Create auth-utils for cookie operations**

Create `src/lib/auth-utils.ts`:

```typescript
import { cookies } from "next/headers";

export async function setCookie(name: string, value: string, options?: { httpOnly?: boolean; path?: string; maxAge?: number }) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, options);
}

export async function deleteCookie(name: string, options?: { path?: string }) {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}
```

Note: This uses the TanStack Start/Next.js cookies API. Adjust if TanStack Start uses a different cookie API — check `src/lib/auth.ts` for the existing pattern.

- [ ] **Step 3: Create useAuth hook**

Create `src/lib/hooks/useAuth.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { meFn } from "#/features/auth/api";

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => meFn({ data: { token: "" } }), // token comes from cookie server-side
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logout = useMutation({
    mutationFn: async () => {
      // Clear cookie via server function, then redirect
      window.location.href = "/login";
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    user: user ?? null,
    isLoading,
    logout: () => logout.mutate(),
  };
}
```

Note: The exact `meFn` invocation depends on how the server function reads the cookie. Since `meFn` is a server function, it should read the cookie server-side. The client just calls `meFn()` without passing the token — the server extracts it from the cookie. Adjust the `meFn` call accordingly. The current `meFn` expects `{ token: string }` — we may need to create a `meFromCookieFn` that reads the cookie internally.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
bun run tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/hooks/useAuth.ts src/features/auth/api-client.ts src/lib/auth-utils.ts
git commit -m "feat(auth): add useAuth hook and cookie management helpers"
```

### Task 1.2: Create login page

**Files:**
- Create: `src/routes/login.tsx`

**Interfaces:**
- Consumes: `loginFn` from `#/features/auth/api`
- Produces: `/login` route

**Steps:**

- [ ] **Step 1: Create the login page**

Create `src/routes/login.tsx`:

```tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "#/features/auth/types";
import { loginFn } from "#/features/auth/api";
import { Button } from "#/lib/components/ui/button";
import { Input } from "#/lib/components/ui/input";
import { Label } from "#/lib/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/lib/components/ui/card";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const login = useMutation({
    mutationFn: (data: LoginInput) => loginFn({ data }),
    onSuccess: () => {
      navigate({ to: "/" });
    },
    onError: (error: Error) => {
      form.setError("root", { message: error.message });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Market Manager</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit((data) => login.mutate(data))} className="space-y-4">
            {form.formState.errors.root && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
bun run tsc --noEmit
```

- [ ] **Step 3: Run dev server and verify login page renders**

```bash
bun run dev
```

Navigate to `http://localhost:3400/login` — verify form renders with email, password, and submit button.

- [ ] **Step 4: Commit**

```bash
git add src/routes/login.tsx
git commit -m "feat(auth): add login page with form validation"
```

### Task 1.3: Create authenticated layout route with auth guard

**Files:**
- Create: `src/routes/_authenticated.tsx`

**Interfaces:**
- Consumes: `useAuth()` from `#/lib/hooks/useAuth`
- Produces: Layout wrapper for all protected routes

**Steps:**

- [ ] **Step 1: Create the authenticated layout route**

Create `src/routes/_authenticated.tsx`:

```tsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "#/lib/hooks/useAuth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    // Server-side auth check happens here
    // If no valid session cookie, redirect to /login
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    // Client-side fallback redirect
    window.location.href = "/login";
    return null;
  }

  return <Outlet />;
}
```

Note: The `beforeLoad` guard needs to verify the session cookie server-side. The exact implementation depends on how TanStack Start handles server-side cookies in `beforeLoad`. We may need to use a server function call within `beforeLoad` to check auth status.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
bun run tsc --noEmit
```

- [ ] **Step 3: Move index.tsx under _authenticated**

The current `src/routes/index.tsx` should become a child of `_authenticated`. Move it to `src/routes/_authenticated/index.tsx`:

```bash
mkdir -p src/routes/_authenticated
mv src/routes/index.tsx src/routes/_authenticated/index.tsx
```

Update the route path in the file if needed (TanStack Router auto-generates from file path).

- [ ] **Step 4: Regenerate route tree**

```bash
bun run generate-routes
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/_authenticated.tsx src/routes/_authenticated/index.tsx src/routeTree.gen.ts
git commit -m "feat(auth): add authenticated layout route with auth guard"
```

---

## Module 2: Layout + Sidebar

### Task 2.1: Create sidebar navigation component

**Files:**
- Create: `src/features/layout/components/AppSidebar.tsx`
- Create: `src/features/layout/components/SidebarNav.tsx`

**Interfaces:**
- Consumes: `useAuth()` from `#/lib/hooks/useAuth`
- Produces: Sidebar component used by `_authenticated.tsx`

**Steps:**

- [ ] **Step 1: Create the navigation items config**

Create `src/features/layout/nav-items.ts`:

```typescript
import {
  LayoutDashboard,
  Package,
  FolderTree,
  BarChart3,
  Truck,
  Receipt,
  CreditCard,
  BarChart,
  Settings,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Products", href: "/products", icon: Package },
  { title: "Categories", href: "/categories", icon: FolderTree },
  { title: "Stock", href: "/stock", icon: BarChart3 },
  { title: "Suppliers", href: "/suppliers", icon: Truck },
  { title: "Invoices", href: "/invoices", icon: Receipt },
  { title: "Checkout", href: "/checkout", icon: CreditCard },
  { title: "Analytics", href: "/analytics", icon: BarChart, adminOnly: true },
  { title: "Settings", href: "/settings", icon: Settings },
];
```

- [ ] **Step 2: Create the AppSidebar component**

Create `src/features/layout/components/AppSidebar.tsx` using the shadcn Sidebar component. Import and compose `Sidebar`, `SidebarContent`, `SidebarHeader`, `SidebarFooter`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`.

- [ ] **Step 3: Create SidebarNav sub-component**

Create `src/features/layout/components/SidebarNav.tsx` that renders the navigation items, filters by role, and highlights the active route using `useLocation()` from TanStack Router.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
bun run tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/features/layout/
git commit -m "feat(layout): add AppSidebar with navigation items"
```

### Task 2.2: Integrate sidebar into authenticated layout

**Files:**
- Modify: `src/routes/_authenticated.tsx`

**Steps:**

- [ ] **Step 1: Wrap Outlet with SidebarProvider and AppSidebar**

Update `_authenticated.tsx` to include the sidebar:

```tsx
import { SidebarProvider, SidebarInset } from "#/lib/components/ui/sidebar";
import { AppSidebar } from "#/features/layout/components/AppSidebar";

function AuthenticatedLayout() {
  // ... auth check ...
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
```

- [ ] **Step 2: Verify the layout renders with sidebar**

```bash
bun run dev
```

Navigate to `/` — should see sidebar with navigation items.

- [ ] **Step 3: Commit**

```bash
git add src/routes/_authenticated.tsx
git commit -m "feat(layout): integrate sidebar into authenticated layout"
```

---

## Module 3: Dashboard

### Task 3.1: Create dashboard page with stats cards

**Files:**
- Create: `src/features/dashboard/components/StatsCards.tsx`
- Modify: `src/routes/_authenticated/index.tsx`

**Interfaces:**
- Consumes: Product count, stock levels, recent invoices (server functions to be called)
- Produces: Dashboard page at `/`

**Steps:**

- [ ] **Step 1: Create StatsCards component**

Create `src/features/dashboard/components/StatsCards.tsx` — 4 cards showing: Total Products, Low Stock Items, Today's Sales, Total Revenue. Use shadcn `Card` component.

- [ ] **Step 2: Update the index route to show dashboard**

Replace the placeholder content in `src/routes/_authenticated/index.tsx` with the dashboard layout:

```tsx
function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <StatsCards />
    </div>
  );
}
```

- [ ] **Step 3: Verify renders**

```bash
bun run dev
```

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard/ src/routes/_authenticated/index.tsx
git commit -m "feat(dashboard): add dashboard page with stats cards"
```

---

## Module 4: Categories

### Task 4.1: Create categories list page

**Files:**
- Create: `src/features/categories/components/CategoryTable.tsx`
- Create: `src/features/categories/hooks/useCategories.ts`
- Create: `src/routes/_authenticated/categories/index.tsx`

**Interfaces:**
- Consumes: `getCategoriesFn` from `#/features/categories/api`
- Produces: `/categories` route

**Steps:**

- [ ] **Step 1: Create useCategories hook**

Create `src/features/categories/hooks/useCategories.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { getCategoriesFn } from "#/features/categories/api";

export const categoriesQueryOptions = {
  queryKey: ["categories"],
  queryFn: () => getCategoriesFn(),
};

export function useCategories() {
  return useQuery(categoriesQueryOptions);
}
```

- [ ] **Step 2: Create CategoryTable component**

Create `src/features/categories/components/CategoryTable.tsx` using TanStack Table + shadcn Table. Columns: Name, Description, Product Count, Created At, Actions (Edit, Delete).

- [ ] **Step 3: Create categories list page**

Create `src/routes/_authenticated/categories/index.tsx` with PageHeader + CategoryTable.

- [ ] **Step 4: Verify renders**

```bash
bun run dev
```

- [ ] **Step 5: Commit**

```bash
git add src/features/categories/components/ src/features/categories/hooks/ src/routes/_authenticated/categories/
git commit -m "feat(categories): add categories list page with table"
```

### Task 4.2: Create category form and create/edit pages

**Files:**
- Create: `src/features/categories/components/CategoryForm.tsx`
- Create: `src/routes/_authenticated/categories/create.tsx`

**Steps:**

- [ ] **Step 1: Create CategoryForm component**

Create `src/features/categories/components/CategoryForm.tsx` using react-hook-form + zod + shadcn Form components. Fields: Name (required), Description (optional).

- [ ] **Step 2: Create categories create page**

Create `src/routes/_authenticated/categories/create.tsx` — renders CategoryForm in create mode, calls `createCategoryFn` on submit, redirects to `/categories`.

- [ ] **Step 3: Add edit capability to CategoryForm**

Update CategoryForm to accept optional `category` prop for edit mode. When provided, pre-fill fields and call `updateCategoryFn` on submit.

- [ ] **Step 4: Create categories edit route**

Create `src/routes/_authenticated/categories/$categoryId.edit.tsx` — loads category by ID, renders CategoryForm in edit mode.

- [ ] **Step 5: Commit**

```bash
git add src/features/categories/components/CategoryForm.tsx src/routes/_authenticated/categories/
git commit -m "feat(categories): add category create/edit form and pages"
```

### Task 4.3: Add delete confirmation dialog

**Files:**
- Create: `src/features/categories/components/CategoryDialog.tsx`

**Steps:**

- [ ] **Step 1: Create delete confirmation dialog**

Create `src/features/categories/components/CategoryDialog.tsx` using shadcn `AlertDialog`. Shows confirmation before calling `deleteCategoryFn`.

- [ ] **Step 2: Integrate into CategoryTable**

Add delete button to table actions column that opens the dialog.

- [ ] **Step 3: Commit**

```bash
git add src/features/categories/components/CategoryDialog.tsx src/features/categories/components/CategoryTable.tsx
git commit -m "feat(categories): add delete confirmation dialog"
```

---

## Module 5: Products

### Task 5.1: Create products list page

**Files:**
- Create: `src/features/products/components/ProductTable.tsx`
- Create: `src/features/products/hooks/useProducts.ts`
- Create: `src/routes/_authenticated/products/index.tsx`

**Interfaces:**
- Consumes: `getProductsFn` from `#/features/products/api`
- Produces: `/products` route

**Steps:**

- [ ] **Step 1: Create useProducts hook with search/filter**

Create `src/features/products/hooks/useProducts.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { getProductsFn } from "#/features/products/api";

export function useProducts(filters?: { search?: string; categoryId?: number; barcode?: string }) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProductsFn({ data: filters ?? {} }),
  });
}
```

- [ ] **Step 2: Create ProductTable component**

Create `src/features/products/components/ProductTable.tsx` — columns: Name, Barcode, Category, Price, Unit, Actions.

- [ ] **Step 3: Create products list page**

Create `src/routes/_authenticated/products/index.tsx` with search input, category filter dropdown, and ProductTable.

- [ ] **Step 4: Commit**

```bash
git add src/features/products/components/ src/features/products/hooks/ src/routes/_authenticated/products/
git commit -m "feat(products): add products list page with search and filters"
```

### Task 5.2: Create product form and create/edit pages

**Files:**
- Create: `src/features/products/components/ProductForm.tsx`
- Create: `src/routes/_authenticated/products/create.tsx`
- Create: `src/routes/_authenticated/products/$productId.edit.tsx`

**Steps:**

- [ ] **Step 1: Create ProductForm component**

Fields: Name, Barcode, Category (select from categories), Price, Unit (select: piece/kg/liter), Description, Image URL.

- [ ] **Step 2: Create products create page**

- [ ] **Step 3: Create products edit page**

- [ ] **Step 4: Commit**

```bash
git add src/features/products/components/ProductForm.tsx src/routes/_authenticated/products/
git commit -m "feat(products): add product create/edit form and pages"
```

### Task 5.3: Add delete confirmation dialog

**Files:**
- Create: `src/features/products/components/ProductDialog.tsx`

**Steps:**

- [ ] **Step 1: Create delete dialog and integrate into table**

- [ ] **Step 2: Commit**

```bash
git add src/features/products/components/ProductDialog.tsx
git commit -m "feat(products): add delete confirmation dialog"
```

---

## Module 6: Suppliers

### Task 6.1: Create suppliers list and CRUD pages

**Files:**
- Create: `src/features/suppliers/components/SupplierTable.tsx`
- Create: `src/features/suppliers/components/SupplierForm.tsx`
- Create: `src/features/suppliers/components/SupplierDialog.tsx`
- Create: `src/features/suppliers/hooks/useSuppliers.ts`
- Create: `src/routes/_authenticated/suppliers/index.tsx`
- Create: `src/routes/_authenticated/suppliers/create.tsx`

**Steps:**

- [ ] **Step 1: Create useSuppliers hook**

- [ ] **Step 2: Create SupplierTable component**

- [ ] **Step 3: Create suppliers list page**

- [ ] **Step 4: Create SupplierForm component**

Fields: Name, Contact Person, Phone, Email, Address.

- [ ] **Step 5: Create suppliers create page**

- [ ] **Step 6: Create SupplierDialog for delete confirmation**

- [ ] **Step 7: Commit**

```bash
git add src/features/suppliers/components/ src/features/suppliers/hooks/ src/routes/_authenticated/suppliers/
git commit -m "feat(suppliers): add suppliers list and CRUD pages"
```

---

## Module 7: Stock

### Task 7.1: Create stock levels page

**Files:**
- Create: `src/features/stock/components/StockLevelsTable.tsx`
- Create: `src/features/stock/hooks/useStock.ts`
- Create: `src/routes/_authenticated/stock/index.tsx`

**Interfaces:**
- Consumes: `getStockLevelsFn` from `#/features/stock/api`
- Produces: `/stock` route

**Steps:**

- [ ] **Step 1: Create useStockLevels hook**

- [ ] **Step 2: Create StockLevelsTable component**

Columns: Product Name, Barcode, Quantity, Status (low stock warning).

- [ ] **Step 3: Create stock page with tabs (Levels | History)**

Use shadcn `Tabs` component.

- [ ] **Step 4: Commit**

```bash
git add src/features/stock/components/ src/features/stock/hooks/ src/routes/_authenticated/stock/
git commit -m "feat(stock): add stock levels page with table"
```

### Task 7.2: Add receive batch and adjustment forms

**Files:**
- Create: `src/features/stock/components/ReceiveBatchForm.tsx`
- Create: `src/features/stock/components/AdjustStockForm.tsx`

**Steps:**

- [ ] **Step 1: Create ReceiveBatchForm**

Fields: Product (select/search), Supplier (select), Batch Number, Quantity, Expiry Date, Purchase Price.

- [ ] **Step 2: Create AdjustStockForm**

Fields: Product (select/search), Quantity Change (+/-), Reason.

- [ ] **Step 3: Add forms to stock page (dialog or tab)**

- [ ] **Step 4: Commit**

```bash
git add src/features/stock/components/ReceiveBatchForm.tsx src/features/stock/components/AdjustStockForm.tsx
git commit -m "feat(stock): add receive batch and adjustment forms"
```

### Task 7.3: Add stock history log

**Files:**
- Create: `src/features/stock/components/StockHistoryTable.tsx`

**Steps:**

- [ ] **Step 1: Create StockHistoryTable component**

- [ ] **Step 2: Integrate into stock page tabs**

- [ ] **Step 3: Commit**

```bash
git add src/features/stock/components/StockHistoryTable.tsx
git commit -m "feat(stock): add stock history log table"
```

---

## Module 8: Checkout (POS)

### Task 8.1: Create full-screen POS terminal layout

**Files:**
- Create: `src/features/checkout/components/PosTerminal.tsx`
- Create: `src/features/checkout/components/ProductGrid.tsx`
- Create: `src/features/checkout/components/Cart.tsx`
- Create: `src/features/checkout/components/PaymentPanel.tsx`
- Create: `src/features/checkout/hooks/useCart.ts`
- Modify: `src/routes/checkout.tsx`

**Interfaces:**
- Consumes: `getProductByBarcodeFn`, `getProductsFn` from `#/features/products/api`
- Consumes: `createInvoiceFn` from `#/features/checkout/api`
- Produces: `/checkout` full-screen route

**Steps:**

- [ ] **Step 1: Create useCart hook (local state)**

```typescript
// Manages cart state: items, add, remove, update quantity, clear, totals
interface CartItem {
  productId: number;
  name: string;
  price: string;
  quantity: number;
}
```

- [ ] **Step 2: Create PosTerminal layout component**

Full-screen flex layout: left panel (product grid/search), right panel (cart + payment).

- [ ] **Step 3: Create ProductGrid component**

Displays products in a grid. Click to add to cart. Search bar at top.

- [ ] **Step 4: Create Cart component**

Shows cart items with editable quantities, remove button, running totals (subtotal, tax, total).

- [ ] **Step 5: Create PaymentPanel component**

Payment method buttons (Cash/Card/Mixed), total display, Complete Sale button.

- [ ] **Step 6: Create checkout route**

Update `src/routes/checkout.tsx` to render PosTerminal (no sidebar).

- [ ] **Step 7: Add keyboard shortcuts**

F2 = focus search, F8 = clear cart, Esc = exit to `/`.

- [ ] **Step 8: Commit**

```bash
git add src/features/checkout/components/ src/features/checkout/hooks/ src/routes/checkout.tsx
git commit -m "feat(checkout): add full-screen POS terminal with cart and payment"
```

### Task 8.2: Add barcode scanning and receipt

**Files:**
- Modify: `src/features/checkout/components/PosTerminal.tsx`
- Create: `src/features/checkout/components/Receipt.tsx`

**Steps:**

- [ ] **Step 1: Add barcode input to PosTerminal**

Auto-focus barcode input. On submit, call `getProductByBarcodeFn` and add to cart.

- [ ] **Step 2: Create Receipt component**

Shows after successful sale: invoice number, items, totals, payment method.

- [ ] **Step 3: Integrate receipt into checkout flow**

After `createInvoiceFn` succeeds, show receipt dialog/print view.

- [ ] **Step 4: Commit**

```bash
git add src/features/checkout/components/
git commit -m "feat(checkout): add barcode scanning and receipt display"
```

---

## Module 9: Invoices

### Task 9.1: Create invoices list page

**Files:**
- Create: `src/features/invoices/components/InvoiceTable.tsx`
- Create: `src/features/invoices/hooks/useInvoices.ts`
- Create: `src/routes/_authenticated/invoices/index.tsx`

**Steps:**

- [ ] **Step 1: Create useInvoices hook with date/user filters**

- [ ] **Step 2: Create InvoiceTable component**

Columns: Invoice #, Cashier, Payment Method, Total, Items, Date, Actions.

- [ ] **Step 3: Create invoices list page with filter controls**

Date range picker, user filter (admin only), payment method filter.

- [ ] **Step 4: Commit**

```bash
git add src/features/invoices/components/ src/features/invoices/hooks/ src/routes/_authenticated/invoices/
git commit -m "feat(invoices): add invoices list page with filters"
```

### Task 9.2: Create invoice detail page

**Files:**
- Create: `src/features/invoices/components/InvoiceDetail.tsx`
- Create: `src/routes/_authenticated/invoices/$invoiceId.tsx`

**Steps:**

- [ ] **Step 1: Create InvoiceDetail component**

Shows full invoice: header info, line items table, totals.

- [ ] **Step 2: Create invoice detail route**

- [ ] **Step 3: Add void action (admin only)**

Button that calls `voidInvoiceFn` with confirmation dialog.

- [ ] **Step 4: Commit**

```bash
git add src/features/invoices/components/InvoiceDetail.tsx src/routes/_authenticated/invoices/$invoiceId.tsx
git commit -m "feat(invoices): add invoice detail page with void action"
```

---

## Module 10: Settings

### Task 10.1: Create settings page with user management

**Files:**
- Create: `src/features/settings/components/StoreSettingsForm.tsx`
- Create: `src/features/settings/components/UserManagement.tsx`
- Create: `src/routes/_authenticated/settings/index.tsx`
- Create: `src/routes/_authenticated/settings/users.tsx`

**Steps:**

- [ ] **Step 1: Create StoreSettingsForm**

Basic form for store name, address, phone, tax rate, receipt header/footer.

- [ ] **Step 2: Create settings index page**

- [ ] **Step 3: Create UserManagement component**

Table of users with create/edit/delete actions. Uses `createUserFn`, `updateUserFn`, `deleteUserFn`.

- [ ] **Step 4: Create users management page**

Admin-only route.

- [ ] **Step 5: Commit**

```bash
git add src/features/settings/ src/routes/_authenticated/settings/
git commit -m "feat(settings): add settings page and user management"
```

---

## Module 11: Analytics

### Task 11.1: Create analytics page with charts

**Files:**
- Create: `src/features/analytics/components/SalesChart.tsx`
- Create: `src/features/analytics/components/TopProducts.tsx`
- Create: `src/features/analytics/hooks/useAnalytics.ts`
- Create: `src/routes/_authenticated/analytics/index.tsx`

**Steps:**

- [ ] **Step 1: Create useAnalytics hook**

- [ ] **Step 2: Create SalesChart component**

Bar/line chart showing sales over time. Use a simple chart library or CSS-based visualization.

- [ ] **Step 3: Create TopProducts component**

Table showing top selling products.

- [ ] **Step 4: Create analytics page**

- [ ] **Step 5: Commit**

```bash
git add src/features/analytics/ src/routes/_authenticated/analytics/
git commit -m "feat(analytics): add analytics page with sales charts"
```

---

## Post-Build Tasks

### Task 12.1: Final polish and verification

**Steps:**

- [ ] **Step 1: Run full TypeScript check**

```bash
bun run tsc --noEmit
```

- [ ] **Step 2: Run biome check**

```bash
bunx biome check --write
```

- [ ] **Step 3: Test all routes manually**

Start dev server, navigate through every page, verify no crashes.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: final polish and type fixes for client-side UI"
```
