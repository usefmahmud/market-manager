# API Endpoints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all server-side API endpoints for the market-manager app using TanStack Start server functions with Zod validation.

**Architecture:** Feature-based server functions organized in `src/features/<feature>/api.ts`. Each feature has Zod schemas in `types.ts` for validation. Auth uses cookie-based sessions with httpOnly cookies. All endpoints are server functions (no REST routes).

**Tech Stack:** TanStack Start (server functions), Drizzle ORM, PostgreSQL (Supabase), Zod, bcryptjs (password hashing)

**Spec:** `docs/PLAN.md`

## Global Constraints

- TypeScript strict mode — no `any` types
- Import alias: `#/` maps to `./src/`
- Biome for linting/formatting (`bun run check`)
- Drizzle schema already exists in `src/db/schema/`
- Supabase PostgreSQL with pgbouncer on port 6543
- Server functions use `createServerFn` from `@tanstack/react-start`
- Zod schemas for all request validation
- Password hashing with bcryptjs
- Sessions via httpOnly cookies with JWT

---

## File Structure

```
src/
├── lib/
│   ├── auth.ts              # Session helpers (create, verify, cookie)
│   └── validators.ts        # Shared Zod refinements
│
├── features/
│   ├── auth/
│   │   ├── types.ts         # loginSchema, registerSchema, AuthUser
│   │   └── api.ts           # loginFn, registerFn, logoutFn, meFn
│   │
│   ├── users/
│   │   ├── types.ts         # userSchema, UserInsert, UserUpdate
│   │   └── api.ts           # getUsersFn, getUserFn, createUserFn, updateUserFn, deleteUserFn
│   │
│   ├── categories/
│   │   ├── types.ts         # categorySchema, CategoryInsert, CategoryUpdate
│   │   └── api.ts           # getCategoriesFn, getCategoryFn, createCategoryFn, updateCategoryFn, deleteCategoryFn
│   │
│   ├── products/
│   │   ├── types.ts         # productSchema, ProductInsert, ProductUpdate
│   │   └── api.ts           # getProductsFn, getProductFn, createProductFn, updateProductFn, deleteProductFn, getProductByBarcodeFn
│   │
│   ├── suppliers/
│   │   ├── types.ts         # supplierSchema, SupplierInsert, SupplierUpdate
│   │   └── api.ts           # getSuppliersFn, getSupplierFn, createSupplierFn, updateSupplierFn, deleteSupplierFn
│   │
│   ├── stock/
│   │   ├── types.ts         # receiveBatchSchema, adjustStockSchema
│   │   └── api.ts           # getStockLevelsFn, receiveBatchFn, adjustStockFn, getStockHistoryFn
│   │
│   ├── checkout/
│   │   ├── types.ts         # checkoutItemSchema, checkoutSchema
│   │   └── api.ts           # createInvoiceFn
│   │
│   └── invoices/
│       ├── types.ts         # invoiceFilterSchema
│       └── api.ts           # getInvoicesFn, getInvoiceFn, voidInvoiceFn
```

---

## Task 1: Auth Feature

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/features/auth/types.ts`
- Create: `src/features/auth/api.ts`

**Interfaces:**
- Consumes: `users` schema from `src/db/schema/users.ts`
- Produces: `loginFn`, `registerFn`, `logoutFn`, `meFn`

- [ ] **Step 1: Install bcryptjs**

Run: `bun add bcryptjs && bun add -D @types/bcryptjs`

- [ ] **Step 2: Create session helpers**

Create `src/lib/auth.ts`:

```typescript
import { sign, verify } from 'hono/jwt'
import { cookies } from 'next/headers'

const SESSION_SECRET = process.env.SESSION_SECRET || 'market-manager-secret-key-change-in-production'
const COOKIE_NAME = 'session'
const EXPIRES_IN = 60 * 60 * 24 * 7 // 7 days

export interface SessionPayload {
  userId: number
  email: string
  role: string
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await sign({ ...payload, exp: Math.floor(Date.now() / 1000) + EXPIRES_IN }, SESSION_SECRET)
  return token
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const payload = await verify(token, SESSION_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export function setSessionCookie(token: string): void {
  // Server function context handles cookies via return value
}

export function getSessionCookieName(): string {
  return COOKIE_NAME
}
```

- [ ] **Step 3: Create auth Zod schemas**

Create `src/features/auth/types.ts`:

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'cashier']).default('cashier'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

export interface AuthUser {
  id: number
  name: string
  email: string
  role: string
}
```

- [ ] **Step 4: Create auth server functions**

Create `src/features/auth/api.ts`:

```typescript
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { hash, compare } from 'bcryptjs'
import { db } from '#/db'
import { users } from '#/db/schema'
import { loginSchema, registerSchema } from './types'
import { createSession, verifySession, getSessionCookieName } from '#/lib/auth'

export const loginFn = createServerFn({ method: 'POST' })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    const user = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
    
    if (user.length === 0) {
      throw new Error('Invalid email or password')
    }

    const valid = await compare(data.password, user[0].passwordHash)
    if (!valid) {
      throw new Error('Invalid email or password')
    }

    const token = await createSession({
      userId: user[0].id,
      email: user[0].email,
      role: user[0].role,
    })

    return {
      token,
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        role: user[0].role,
      },
    }
  })

export const registerFn = createServerFn({ method: 'POST' })
  .validator(registerSchema)
  .handler(async ({ data }) => {
    const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
    
    if (existing.length > 0) {
      throw new Error('Email already registered')
    }

    const passwordHash = await hash(data.password, 10)
    
    const newUser = await db.insert(users).values({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    }).returning()

    const token = await createSession({
      userId: newUser[0].id,
      email: newUser[0].email,
      role: newUser[0].role,
    })

    return {
      token,
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        role: newUser[0].role,
      },
    }
  })

export const logoutFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    return { success: true }
  })

export const meFn = createServerFn({ method: 'GET' })
  .validator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    const session = await verifySession(data.token)
    
    if (!session) {
      throw new Error('Not authenticated')
    }

    const user = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
    
    if (user.length === 0) {
      throw new Error('User not found')
    }

    return {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      role: user[0].role,
    }
  })
```

- [ ] **Step 5: Run lint check**

Run: `bun run check`
Expected: Pass

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth.ts src/features/auth/
git commit -m "feat: add auth feature with login, register, logout, me endpoints"
```

---

## Task 2: Users Feature

**Files:**
- Create: `src/features/users/types.ts`
- Create: `src/features/users/api.ts`

**Interfaces:**
- Consumes: `users` schema, `SessionPayload` from auth
- Produces: `getUsersFn`, `getUserFn`, `createUserFn`, `updateUserFn`, `deleteUserFn`

- [ ] **Step 1: Create users Zod schemas**

Create `src/features/users/types.ts`:

```typescript
import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'cashier']).default('cashier'),
})

export const updateUserSchema = z.object({
  id: z.number(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['admin', 'cashier']).optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

export interface User {
  id: number
  name: string
  email: string
  role: string
  createdAt: Date | null
}
```

- [ ] **Step 2: Create users server functions**

Create `src/features/users/api.ts`:

```typescript
import { createServerFn } from '@tanstack/react-start'
import { eq, desc } from 'drizzle-orm'
import { hash } from 'bcryptjs'
import { db } from '#/db'
import { users } from '#/db/schema'
import { createUserSchema, updateUserSchema } from './types'

export const getUsersFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt))
    return allUsers.map(({ passwordHash, ...user }) => user)
  })

export const getUserFn = createServerFn({ method: 'GET' })
  .validator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const user = await db.select().from(users).where(eq(users.id, data.id)).limit(1)
    
    if (user.length === 0) {
      throw new Error('User not found')
    }

    const { passwordHash, ...rest } = user[0]
    return rest
  })

export const createUserFn = createServerFn({ method: 'POST' })
  .validator(createUserSchema)
  .handler(async ({ data }) => {
    const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
    
    if (existing.length > 0) {
      throw new Error('Email already registered')
    }

    const passwordHash = await hash(data.password, 10)
    
    const newUser = await db.insert(users).values({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    }).returning()

    const { passwordHash: _, ...rest } = newUser[0]
    return rest
  })

export const updateUserFn = createServerFn({ method: 'POST' })
  .validator(updateUserSchema)
  .handler(async ({ data }) => {
    const { id, password, ...updates } = data
    
    const updateData: Record<string, unknown> = { ...updates, updatedAt: new Date() }
    
    if (password) {
      updateData.passwordHash = await hash(password, 10)
    }

    const updated = await db.update(users).set(updateData).where(eq(users.id, id)).returning()
    
    if (updated.length === 0) {
      throw new Error('User not found')
    }

    const { passwordHash, ...rest } = updated[0]
    return rest
  })

export const deleteUserFn = createServerFn({ method: 'POST' })
  .validator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const deleted = await db.delete(users).where(eq(users.id, data.id)).returning()
    
    if (deleted.length === 0) {
      throw new Error('User not found')
    }

    return { success: true }
  })
```

- [ ] **Step 3: Run lint check**

Run: `bun run check`
Expected: Pass

- [ ] **Step 4: Commit**

```bash
git add src/features/users/
git commit -m "feat: add users feature with CRUD endpoints"
```

---

## Task 3: Categories Feature

**Files:**
- Create: `src/features/categories/types.ts`
- Create: `src/features/categories/api.ts`

**Interfaces:**
- Consumes: `categories` schema
- Produces: `getCategoriesFn`, `getCategoryFn`, `createCategoryFn`, `updateCategoryFn`, `deleteCategoryFn`

- [ ] **Step 1: Create categories Zod schemas**

Create `src/features/categories/types.ts`:

```typescript
import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  parentId: z.number().nullable().optional(),
})

export const createCategorySchema = categorySchema

export const updateCategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  parentId: z.number().nullable().optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

export interface Category {
  id: number
  name: string
  description: string | null
  parentId: number | null
  createdAt: Date | null
}

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
  productCount?: number
}
```

- [ ] **Step 2: Create categories server functions**

Create `src/features/categories/api.ts`:

```typescript
import { createServerFn } from '@tanstack/react-start'
import { eq, desc, sql } from 'drizzle-orm'
import { db } from '#/db'
import { categories, products } from '#/db/schema'
import { createCategorySchema, updateCategorySchema } from './types'

export const getCategoriesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const allCategories = await db.select().from(categories).orderBy(desc(categories.createdAt))
    return allCategories
  })

export const getCategoryFn = createServerFn({ method: 'GET' })
  .validator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const category = await db.select().from(categories).where(eq(categories.id, data.id)).limit(1)
    
    if (category.length === 0) {
      throw new Error('Category not found')
    }

    return category[0]
  })

export const createCategoryFn = createServerFn({ method: 'POST' })
  .validator(createCategorySchema)
  .handler(async ({ data }) => {
    const newCategory = await db.insert(categories).values(data).returning()
    return newCategory[0]
  })

export const updateCategoryFn = createServerFn({ method: 'POST' })
  .validator(updateCategorySchema)
  .handler(async ({ data }) => {
    const { id, ...updates } = data
    
    const updated = await db.update(categories).set(updates).where(eq(categories.id, id)).returning()
    
    if (updated.length === 0) {
      throw new Error('Category not found')
    }

    return updated[0]
  })

export const deleteCategoryFn = createServerFn({ method: 'POST' })
  .validator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const productCount = await db.select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.categoryId, data.id))
    
    if (productCount[0].count > 0) {
      throw new Error('Cannot delete category with products')
    }

    const deleted = await db.delete(categories).where(eq(categories.id, data.id)).returning()
    
    if (deleted.length === 0) {
      throw new Error('Category not found')
    }

    return { success: true }
  })
```

- [ ] **Step 3: Run lint check**

Run: `bun run check`
Expected: Pass

- [ ] **Step 4: Commit**

```bash
git add src/features/categories/
git commit -m "feat: add categories feature with CRUD endpoints"
```

---

## Task 4: Products Feature

**Files:**
- Create: `src/features/products/types.ts`
- Create: `src/features/products/api.ts`

**Interfaces:**
- Consumes: `products` schema, `categories` schema
- Produces: `getProductsFn`, `getProductFn`, `createProductFn`, `updateProductFn`, `deleteProductFn`, `getProductByBarcodeFn`

- [ ] **Step 1: Create products Zod schemas**

Create `src/features/products/types.ts`:

```typescript
import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  barcode: z.string().optional(),
  categoryId: z.number().nullable().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  unit: z.enum(['piece', 'kg', 'liter']).default('piece'),
  description: z.string().optional(),
  image: z.string().url('Invalid URL').optional(),
})

export const createProductSchema = productSchema

export const updateProductSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  barcode: z.string().optional(),
  categoryId: z.number().nullable().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  unit: z.enum(['piece', 'kg', 'liter']).optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>

export interface Product {
  id: number
  name: string
  barcode: string | null
  categoryId: number | null
  price: string
  unit: string | null
  description: string | null
  image: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

export interface ProductWithCategory extends Product {
  categoryName?: string
}
```

- [ ] **Step 2: Create products server functions**

Create `src/features/products/api.ts`:

```typescript
import { createServerFn } from '@tanstack/react-start'
import { eq, desc, sql, ilike } from 'drizzle-orm'
import { db } from '#/db'
import { products, categories } from '#/db/schema'
import { createProductSchema, updateProductSchema } from './types'

export const getProductsFn = createServerFn({ method: 'GET' })
  .validator((input: { search?: string; categoryId?: number }) => input)
  .handler(async ({ data }) => {
    let query = db.select({
      id: products.id,
      name: products.name,
      barcode: products.barcode,
      categoryId: products.categoryId,
      price: products.price,
      unit: products.unit,
      description: products.description,
      image: products.image,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryName: categories.name,
    })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(desc(products.createdAt))

    if (data.search) {
      query = query.where(ilike(products.name, `%${data.search}%`))
    }

    if (data.categoryId) {
      query = query.where(eq(products.categoryId, data.categoryId))
    }

    return await query
  })

export const getProductFn = createServerFn({ method: 'GET' })
  .validator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const product = await db.select().from(products).where(eq(products.id, data.id)).limit(1)
    
    if (product.length === 0) {
      throw new Error('Product not found')
    }

    return product[0]
  })

export const getProductByBarcodeFn = createServerFn({ method: 'GET' })
  .validator((input: { barcode: string }) => input)
  .handler(async ({ data }) => {
    const product = await db.select().from(products).where(eq(products.barcode, data.barcode)).limit(1)
    
    if (product.length === 0) {
      throw new Error('Product not found')
    }

    return product[0]
  })

export const createProductFn = createServerFn({ method: 'POST' })
  .validator(createProductSchema)
  .handler(async ({ data }) => {
    if (data.barcode) {
      const existing = await db.select().from(products).where(eq(products.barcode, data.barcode)).limit(1)
      if (existing.length > 0) {
        throw new Error('Barcode already exists')
      }
    }

    const newProduct = await db.insert(products).values(data).returning()
    return newProduct[0]
  })

export const updateProductFn = createServerFn({ method: 'POST' })
  .validator(updateProductSchema)
  .handler(async ({ data }) => {
    const { id, ...updates } = data
    
    if (updates.barcode) {
      const existing = await db.select().from(products)
        .where(eq(products.barcode, updates.barcode))
        .limit(1)
      if (existing.length > 0 && existing[0].id !== id) {
        throw new Error('Barcode already exists')
      }
    }

    const updated = await db.update(products).set({ ...updates, updatedAt: new Date() }).where(eq(products.id, id)).returning()
    
    if (updated.length === 0) {
      throw new Error('Product not found')
    }

    return updated[0]
  })

export const deleteProductFn = createServerFn({ method: 'POST' })
  .validator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const deleted = await db.delete(products).where(eq(products.id, data.id)).returning()
    
    if (deleted.length === 0) {
      throw new Error('Product not found')
    }

    return { success: true }
  })
```

- [ ] **Step 3: Run lint check**

Run: `bun run check`
Expected: Pass

- [ ] **Step 4: Commit**

```bash
git add src/features/products/
git commit -m "feat: add products feature with CRUD and barcode lookup endpoints"
```

---

## Task 5: Suppliers Feature

**Files:**
- Create: `src/features/suppliers/types.ts`
- Create: `src/features/suppliers/api.ts`

**Interfaces:**
- Consumes: `suppliers` schema
- Produces: `getSuppliersFn`, `getSupplierFn`, `createSupplierFn`, `updateSupplierFn`, `deleteSupplierFn`

- [ ] **Step 1: Create suppliers Zod schemas**

Create `src/features/suppliers/types.ts`:

```typescript
import { z } from 'zod'

export const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
})

export const createSupplierSchema = supplierSchema

export const updateSupplierSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
})

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>

export interface Supplier {
  id: number
  name: string
  contactPerson: string | null
  phone: string | null
  email: string | null
  address: string | null
  createdAt: Date | null
}
```

- [ ] **Step 2: Create suppliers server functions**

Create `src/features/suppliers/api.ts`:

```typescript
import { createServerFn } from '@tanstack/react-start'
import { eq, desc } from 'drizzle-orm'
import { db } from '#/db'
import { suppliers } from '#/db/schema'
import { createSupplierSchema, updateSupplierSchema } from './types'

export const getSuppliersFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt))
  })

export const getSupplierFn = createServerFn({ method: 'GET' })
  .validator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const supplier = await db.select().from(suppliers).where(eq(suppliers.id, data.id)).limit(1)
    
    if (supplier.length === 0) {
      throw new Error('Supplier not found')
    }

    return supplier[0]
  })

export const createSupplierFn = createServerFn({ method: 'POST' })
  .validator(createSupplierSchema)
  .handler(async ({ data }) => {
    const newSupplier = await db.insert(suppliers).values(data).returning()
    return newSupplier[0]
  })

export const updateSupplierFn = createServerFn({ method: 'POST' })
  .validator(updateSupplierSchema)
  .handler(async ({ data }) => {
    const { id, ...updates } = data
    
    const updated = await db.update(suppliers).set(updates).where(eq(suppliers.id, id)).returning()
    
    if (updated.length === 0) {
      throw new Error('Supplier not found')
    }

    return updated[0]
  })

export const deleteSupplierFn = createServerFn({ method: 'POST' })
  .validator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const deleted = await db.delete(suppliers).where(eq(suppliers.id, data.id)).returning()
    
    if (deleted.length === 0) {
      throw new Error('Supplier not found')
    }

    return { success: true }
  })
```

- [ ] **Step 3: Run lint check**

Run: `bun run check`
Expected: Pass

- [ ] **Step 4: Commit**

```bash
git add src/features/suppliers/
git commit -m "feat: add suppliers feature with CRUD endpoints"
```

---

## Task 6: Stock Feature

**Files:**
- Create: `src/features/stock/types.ts`
- Create: `src/features/stock/api.ts`

**Interfaces:**
- Consumes: `stockBatches`, `stockAdjustments`, `products` schemas
- Produces: `getStockLevelsFn`, `receiveBatchFn`, `adjustStockFn`, `getStockHistoryFn`

- [ ] **Step 1: Create stock Zod schemas**

Create `src/features/stock/types.ts`:

```typescript
import { z } from 'zod'

export const receiveBatchSchema = z.object({
  productId: z.number(),
  supplierId: z.number().nullable().optional(),
  batchNumber: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be positive'),
  expiryDate: z.string().datetime().optional(),
  purchasePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price').optional(),
  receivedBy: z.number(),
})

export const adjustStockSchema = z.object({
  productId: z.number(),
  quantityChange: z.number().int(),
  reason: z.string().min(1, 'Reason is required'),
  adjustedBy: z.number(),
})

export type ReceiveBatchInput = z.infer<typeof receiveBatchSchema>
export type AdjustStockInput = z.infer<typeof adjustStockSchema>

export interface StockLevel {
  productId: number
  productName: string
  barcode: string | null
  totalQuantity: number
}

export interface StockHistoryItem {
  id: number
  type: 'batch' | 'adjustment'
  productId: number
  productName: string
  quantity: number
  reason: string | null
  batchNumber: string | null
  userName: string | null
  createdAt: Date | null
}
```

- [ ] **Step 2: Create stock server functions**

Create `src/features/stock/api.ts`:

```typescript
import { createServerFn } from '@tanstack/react-start'
import { eq, sql, desc } from 'drizzle-orm'
import { db } from '#/db'
import { stockBatches, stockAdjustments, products, users } from '#/db/schema'
import { receiveBatchSchema, adjustStockSchema } from './types'

export const getStockLevelsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const levels = await db.select({
      productId: products.id,
      productName: products.name,
      barcode: products.barcode,
      totalQuantity: sql<number>`coalesce(sum(${stockBatches.quantity}), 0) - coalesce((
        select coalesce(abs(sum(${stockAdjustments.quantityChange})), 0)
        from ${stockAdjustments}
        where ${stockAdjustments.productId} = ${products.id}
      ), 0)`,
    })
      .from(products)
      .leftJoin(stockBatches, eq(products.id, stockBatches.productId))
      .groupBy(products.id, products.name, products.barcode)
      .orderBy(products.name)

    return levels
  })

export const receiveBatchFn = createServerFn({ method: 'POST' })
  .validator(receiveBatchSchema)
  .handler(async ({ data }) => {
    const newBatch = await db.insert(stockBatches).values({
      productId: data.productId,
      supplierId: data.supplierId ?? null,
      batchNumber: data.batchNumber ?? null,
      quantity: data.quantity,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      purchasePrice: data.purchasePrice ?? null,
      receivedBy: data.receivedBy,
    }).returning()

    return newBatch[0]
  })

export const adjustStockFn = createServerFn({ method: 'POST' })
  .validator(adjustStockSchema)
  .handler(async ({ data }) => {
    const newAdjustment = await db.insert(stockAdjustments).values({
      productId: data.productId,
      quantityChange: data.quantityChange,
      reason: data.reason,
      adjustedBy: data.adjustedBy,
    }).returning()

    return newAdjustment[0]
  })

export const getStockHistoryFn = createServerFn({ method: 'GET' })
  .validator((input: { productId?: number }) => input)
  .handler(async ({ data }) => {
    const batchHistory = await db.select({
      id: stockBatches.id,
      type: sql<string>`'batch'`,
      productId: stockBatches.productId,
      productName: products.name,
      quantity: stockBatches.quantity,
      reason: stockBatches.batchNumber,
      batchNumber: stockBatches.batchNumber,
      userName: users.name,
      createdAt: stockBatches.createdAt,
    })
      .from(stockBatches)
      .innerJoin(products, eq(stockBatches.productId, products.id))
      .leftJoin(users, eq(stockBatches.receivedBy, users.id))
      .orderBy(desc(stockBatches.createdAt))

    const adjustmentHistory = await db.select({
      id: stockAdjustments.id,
      type: sql<string>`'adjustment'`,
      productId: stockAdjustments.productId,
      productName: products.name,
      quantity: stockAdjustments.quantityChange,
      reason: stockAdjustments.reason,
      batchNumber: sql<string>`null`,
      userName: users.name,
      createdAt: stockAdjustments.createdAt,
    })
      .from(stockAdjustments)
      .innerJoin(products, eq(stockAdjustments.productId, products.id))
      .leftJoin(users, eq(stockAdjustments.adjustedBy, users.id))
      .orderBy(desc(stockAdjustments.createdAt))

    let history = [...batchHistory, ...adjustmentHistory].sort(
      (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    )

    if (data.productId) {
      history = history.filter(item => item.productId === data.productId)
    }

    return history
  })
```

- [ ] **Step 3: Run lint check**

Run: `bun run check`
Expected: Pass

- [ ] **Step 4: Commit**

```bash
git add src/features/stock/
git commit -m "feat: add stock feature with levels, receive, adjust, history endpoints"
```

---

## Task 7: Checkout Feature

**Files:**
- Create: `src/features/checkout/types.ts`
- Create: `src/features/checkout/api.ts`

**Interfaces:**
- Consumes: `invoices`, `invoiceItems`, `products`, `stockBatches` schemas
- Produces: `createInvoiceFn`

- [ ] **Step 1: Create checkout Zod schemas**

Create `src/features/checkout/types.ts`:

```typescript
import { z } from 'zod'

export const checkoutItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().int().positive(),
  unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
})

export const checkoutSchema = z.object({
  userId: z.number(),
  paymentMethod: z.enum(['cash', 'card', 'mixed']),
  items: z.array(checkoutItemSchema).min(1, 'At least one item required'),
  subtotal: z.string().regex(/^\d+(\.\d{1,2})?$/),
  tax: z.string().regex(/^\d+(\.\d{1,2})?$/),
  total: z.string().regex(/^\d+(\.\d{1,2})?$/),
})

export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>

export interface Invoice {
  id: number
  invoiceNumber: string
  userId: number
  paymentMethod: string
  subtotal: string
  tax: string
  total: string
  createdAt: Date | null
}

export interface InvoiceItem {
  id: number
  invoiceId: number
  productId: number
  quantity: number
  unitPrice: string
  total: string
}
```

- [ ] **Step 2: Create checkout server function**

Create `src/features/checkout/api.ts`:

```typescript
import { createServerFn } from '@tanstack/react-start'
import { eq, sql } from 'drizzle-orm'
import { db } from '#/db'
import { invoices, invoiceItems, products } from '#/db/schema'
import { checkoutSchema } from './types'

async function generateInvoiceNumber(): Promise<string> {
  const lastInvoice = await db.select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .orderBy(sql`${invoices.id} desc`)
    .limit(1)

  if (lastInvoice.length === 0) {
    return 'INV-000001'
  }

  const lastNumber = parseInt(lastInvoice[0].invoiceNumber.split('-')[1])
  const nextNumber = lastNumber + 1
  return `INV-${nextNumber.toString().padStart(6, '0')}`
}

export const createInvoiceFn = createServerFn({ method: 'POST' })
  .validator(checkoutSchema)
  .handler(async ({ data }) => {
    const invoiceNumber = await generateInvoiceNumber()

    const newInvoice = await db.insert(invoices).values({
      invoiceNumber,
      userId: data.userId,
      paymentMethod: data.paymentMethod,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
    }).returning()

    const invoiceItemsData = data.items.map(item => ({
      invoiceId: newInvoice[0].id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: (parseFloat(item.unitPrice) * item.quantity).toFixed(2),
    }))

    await db.insert(invoiceItems).values(invoiceItemsData)

    for (const item of data.items) {
      await db.update(products)
        .set({ updatedAt: new Date() })
        .where(eq(products.id, item.productId))
    }

    return {
      invoice: newInvoice[0],
      items: invoiceItemsData,
    }
  })
```

- [ ] **Step 3: Run lint check**

Run: `bun run check`
Expected: Pass

- [ ] **Step 4: Commit**

```bash
git add src/features/checkout/
git commit -m "feat: add checkout feature with create invoice endpoint"
```

---

## Task 8: Invoices Feature

**Files:**
- Create: `src/features/invoices/types.ts`
- Create: `src/features/invoices/api.ts`

**Interfaces:**
- Consumes: `invoices`, `invoiceItems`, `products`, `users` schemas
- Produces: `getInvoicesFn`, `getInvoiceFn`, `voidInvoiceFn`

- [ ] **Step 1: Create invoices Zod schemas**

Create `src/features/invoices/types.ts`:

```typescript
import { z } from 'zod'

export const invoiceFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  userId: z.number().optional(),
  paymentMethod: z.enum(['cash', 'card', 'mixed']).optional(),
})

export type InvoiceFilterInput = z.infer<typeof invoiceFilterSchema>

export interface InvoiceListItem {
  id: number
  invoiceNumber: string
  userId: number
  userName: string | null
  paymentMethod: string
  subtotal: string
  tax: string
  total: string
  itemCount: number
  createdAt: Date | null
}

export interface InvoiceDetail {
  id: number
  invoiceNumber: string
  userId: number
  userName: string | null
  paymentMethod: string
  subtotal: string
  tax: string
  total: string
  createdAt: Date | null
  items: InvoiceItemDetail[]
}

export interface InvoiceItemDetail {
  id: number
  productId: number
  productName: string
  quantity: number
  unitPrice: string
  total: string
}
```

- [ ] **Step 2: Create invoices server functions**

Create `src/features/invoices/api.ts`:

```typescript
import { createServerFn } from '@tanstack/react-start'
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm'
import { db } from '#/db'
import { invoices, invoiceItems, products, users } from '#/db/schema'
import { invoiceFilterSchema } from './types'

export const getInvoicesFn = createServerFn({ method: 'GET' })
  .validator(invoiceFilterSchema)
  .handler(async ({ data }) => {
    let query = db.select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      userId: invoices.userId,
      userName: users.name,
      paymentMethod: invoices.paymentMethod,
      subtotal: invoices.subtotal,
      tax: invoices.tax,
      total: invoices.total,
      itemCount: sql<number>`(select count(*) from ${invoiceItems} where ${invoiceItems.invoiceId} = ${invoices.id})`,
      createdAt: invoices.createdAt,
    })
      .from(invoices)
      .leftJoin(users, eq(invoices.userId, users.id))
      .orderBy(desc(invoices.createdAt))

    if (data.startDate) {
      query = query.where(gte(invoices.createdAt, new Date(data.startDate)))
    }

    if (data.endDate) {
      query = query.where(lte(invoices.createdAt, new Date(data.endDate)))
    }

    if (data.userId) {
      query = query.where(eq(invoices.userId, data.userId))
    }

    if (data.paymentMethod) {
      query = query.where(eq(invoices.paymentMethod, data.paymentMethod))
    }

    return await query
  })

export const getInvoiceFn = createServerFn({ method: 'GET' })
  .validator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const invoice = await db.select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      userId: invoices.userId,
      userName: users.name,
      paymentMethod: invoices.paymentMethod,
      subtotal: invoices.subtotal,
      tax: invoices.tax,
      total: invoices.total,
      createdAt: invoices.createdAt,
    })
      .from(invoices)
      .leftJoin(users, eq(invoices.userId, users.id))
      .where(eq(invoices.id, data.id))
      .limit(1)
    
    if (invoice.length === 0) {
      throw new Error('Invoice not found')
    }

    const items = await db.select({
      id: invoiceItems.id,
      productId: invoiceItems.productId,
      productName: products.name,
      quantity: invoiceItems.quantity,
      unitPrice: invoiceItems.unitPrice,
      total: invoiceItems.total,
    })
      .from(invoiceItems)
      .innerJoin(products, eq(invoiceItems.productId, products.id))
      .where(eq(invoiceItems.invoiceId, data.id))

    return {
      ...invoice[0],
      items,
    }
  })

export const voidInvoiceFn = createServerFn({ method: 'POST' })
  .validator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const invoice = await db.select().from(invoices).where(eq(invoices.id, data.id)).limit(1)
    
    if (invoice.length === 0) {
      throw new Error('Invoice not found')
    }

    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, data.id))
    await db.delete(invoices).where(eq(invoices.id, data.id))

    return { success: true }
  })
```

- [ ] **Step 3: Run lint check**

Run: `bun run check`
Expected: Pass

- [ ] **Step 4: Commit**

```bash
git add src/features/invoices/
git commit -m "feat: add invoices feature with list, detail, void endpoints"
```
