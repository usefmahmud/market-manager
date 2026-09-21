import { createServerFn } from "@tanstack/react-start";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "#/db";
import { products, stockAdjustments, stockBatches, users } from "#/db/schema";
import { adjustStockSchema, receiveBatchSchema } from "./types";

export const getStockLevelsFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const levels = await db
			.select({
				productId: products.id,
				productName: products.name,
				barcode: products.barcode,
				totalQuantity: sql<number>`coalesce(sum(${stockBatches.quantity}), 0) + coalesce((
					select coalesce(sum(${stockAdjustments.quantityChange}), 0)
					from ${stockAdjustments}
					where ${stockAdjustments.productId} = ${products.id}
				), 0)`,
			})
			.from(products)
			.leftJoin(stockBatches, eq(products.id, stockBatches.productId))
			.groupBy(products.id, products.name, products.barcode)
			.orderBy(products.name);

		return levels;
	},
);

export const receiveBatchFn = createServerFn({ method: "POST" })
	.validator(receiveBatchSchema)
	.handler(async ({ data }) => {
		const newBatch = await db
			.insert(stockBatches)
			.values({
				productId: data.productId,
				supplierId: data.supplierId ?? null,
				batchNumber: data.batchNumber ?? null,
				quantity: data.quantity,
				expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
				purchasePrice: data.purchasePrice ?? null,
				receivedBy: data.receivedBy,
			})
			.returning();

		return newBatch[0];
	});

export const adjustStockFn = createServerFn({ method: "POST" })
	.validator(adjustStockSchema)
	.handler(async ({ data }) => {
		const newAdjustment = await db
			.insert(stockAdjustments)
			.values({
				productId: data.productId,
				quantityChange: data.quantityChange,
				reason: data.reason,
				adjustedBy: data.adjustedBy,
			})
			.returning();

		return newAdjustment[0];
	});

export const getStockHistoryFn = createServerFn({ method: "GET" })
	.validator((input: { productId?: number }) => input)
	.handler(async ({ data }) => {
		const batchHistory = await db
			.select({
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
			.orderBy(desc(stockBatches.createdAt));

		const adjustmentHistory = await db
			.select({
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
			.orderBy(desc(stockAdjustments.createdAt));

		let history = [...batchHistory, ...adjustmentHistory].sort(
			(a, b) =>
				new Date(b.createdAt ?? 0).getTime() -
				new Date(a.createdAt ?? 0).getTime(),
		);

		if (data.productId) {
			history = history.filter((item) => item.productId === data.productId);
		}

		return history;
	});
