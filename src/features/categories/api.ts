import { createServerFn } from "@tanstack/react-start";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "#/db";
import { categories, products } from "#/db/schema";
import { deleteRecord } from "#/lib/db-helpers";
import { createCategorySchema, updateCategorySchema } from "./types";

export const getCategoriesFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const allCategories = await db
			.select({
				id: categories.id,
				name: categories.name,
				description: categories.description,
				createdAt: categories.createdAt,
				productCount: sql<number>`(select count(*) from ${products} where ${products.categoryId} = ${categories.id})`,
			})
			.from(categories)
			.orderBy(desc(categories.createdAt));
		return allCategories;
	},
);

export const getCategoryFn = createServerFn({ method: "GET" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		const category = await db
			.select()
			.from(categories)
			.where(eq(categories.id, data.id))
			.limit(1);

		if (category.length === 0) {
			throw new Error("Category not found");
		}

		return category[0];
	});

export const createCategoryFn = createServerFn({ method: "POST" })
	.validator(createCategorySchema)
	.handler(async ({ data }) => {
		const newCategory = await db.insert(categories).values(data).returning();
		return newCategory[0];
	});

export const updateCategoryFn = createServerFn({ method: "POST" })
	.validator(updateCategorySchema)
	.handler(async ({ data }) => {
		const { id, ...updates } = data;

		const updated = await db
			.update(categories)
			.set(updates)
			.where(eq(categories.id, id))
			.returning();

		if (updated.length === 0) {
			throw new Error("Category not found");
		}

		return updated[0];
	});

export const deleteCategoryFn = createServerFn({ method: "POST" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		const productCount = await db
			.select({ count: sql<number>`count(*)` })
			.from(products)
			.where(eq(products.categoryId, data.id));

		if (productCount[0].count > 0) {
			throw new Error("Cannot delete category with products");
		}

		return deleteRecord({
			tableName: "Category",
			id: data.id,
			table: categories,
			errorMessage: "Category not found",
		});
	});
