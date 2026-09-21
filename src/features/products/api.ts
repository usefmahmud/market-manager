import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "#/db";
import { categories, products } from "#/db/schema";
import { deleteRecord } from "#/lib/db-helpers";
import { createProductSchema, updateProductSchema } from "./types";

export const getProductsFn = createServerFn({ method: "GET" })
	.validator(
		(input: { search?: string; categoryId?: number; barcode?: string }) =>
			input,
	)
	.handler(async ({ data }) => {
		const conditions = [sql`1 = 1`];

		if (data.search) {
			conditions.push(ilike(products.name, `%${data.search}%`));
		}

		if (data.categoryId) {
			conditions.push(eq(products.categoryId, data.categoryId));
		}

		if (data.barcode) {
			conditions.push(eq(products.barcode, data.barcode));
		}

		return await db
			.select({
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
			.where(and(...conditions))
			.orderBy(desc(products.createdAt));
	});

export const getProductFn = createServerFn({ method: "GET" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		const product = await db
			.select()
			.from(products)
			.where(eq(products.id, data.id))
			.limit(1);

		if (product.length === 0) {
			throw new Error("Product not found");
		}

		return product[0];
	});

export const getProductByBarcodeFn = createServerFn({ method: "GET" })
	.validator((input: { barcode: string }) => input)
	.handler(async ({ data }) => {
		const product = await db
			.select()
			.from(products)
			.where(eq(products.barcode, data.barcode))
			.limit(1);

		if (product.length === 0) {
			throw new Error("Product not found");
		}

		return product[0];
	});

export const createProductFn = createServerFn({ method: "POST" })
	.validator(createProductSchema)
	.handler(async ({ data }) => {
		if (data.barcode) {
			const existing = await db
				.select()
				.from(products)
				.where(eq(products.barcode, data.barcode))
				.limit(1);
			if (existing.length > 0) {
				throw new Error("Barcode already exists");
			}
		}

		const newProduct = await db.insert(products).values(data).returning();
		return newProduct[0];
	});

export const updateProductFn = createServerFn({ method: "POST" })
	.validator(updateProductSchema)
	.handler(async ({ data }) => {
		const { id, ...updates } = data;

		if (updates.barcode) {
			const existing = await db
				.select()
				.from(products)
				.where(eq(products.barcode, updates.barcode))
				.limit(1);
			if (existing.length > 0 && existing[0].id !== id) {
				throw new Error("Barcode already exists");
			}
		}

		const updated = await db
			.update(products)
			.set({ ...updates, updatedAt: new Date() })
			.where(eq(products.id, id))
			.returning();

		if (updated.length === 0) {
			throw new Error("Product not found");
		}

		return updated[0];
	});

export const deleteProductFn = createServerFn({ method: "POST" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		return deleteRecord({
			tableName: "Product",
			id: data.id,
			table: products,
			errorMessage: "Product not found",
		});
	});
