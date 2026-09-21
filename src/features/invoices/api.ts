import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { db } from "#/db";
import { invoiceItems, invoices, products, stockAdjustments, users } from "#/db/schema";
import { invoiceFilterSchema } from "./types";

export const getInvoicesFn = createServerFn({ method: "GET" })
	.validator(invoiceFilterSchema)
	.handler(async ({ data }) => {
		const conditions = [isNull(invoices.voidedAt)];

		if (data.startDate) {
			conditions.push(gte(invoices.createdAt, new Date(data.startDate)));
		}

		if (data.endDate) {
			conditions.push(lte(invoices.createdAt, new Date(data.endDate)));
		}

		if (data.userId) {
			conditions.push(eq(invoices.userId, data.userId));
		}

		if (data.paymentMethod) {
			conditions.push(eq(invoices.paymentMethod, data.paymentMethod));
		}

		return await db
			.select({
				id: invoices.id,
				invoiceNumber: invoices.invoiceNumber,
				userId: invoices.userId,
				userName: users.name,
				paymentMethod: invoices.paymentMethod,
				subtotal: invoices.subtotal,
				tax: invoices.tax,
				total: invoices.total,
				itemCount: sql<number>`(select count(*) from ${invoiceItems} where ${invoiceItems.invoiceId} = ${invoices.id})`,
				voidedAt: invoices.voidedAt,
				createdAt: invoices.createdAt,
			})
			.from(invoices)
			.leftJoin(users, eq(invoices.userId, users.id))
			.where(and(...conditions))
			.orderBy(desc(invoices.createdAt));
	});

export const getInvoiceFn = createServerFn({ method: "GET" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		const invoice = await db
			.select({
				id: invoices.id,
				invoiceNumber: invoices.invoiceNumber,
				userId: invoices.userId,
				userName: users.name,
				paymentMethod: invoices.paymentMethod,
				subtotal: invoices.subtotal,
				tax: invoices.tax,
				total: invoices.total,
				voidedAt: invoices.voidedAt,
				createdAt: invoices.createdAt,
			})
			.from(invoices)
			.leftJoin(users, eq(invoices.userId, users.id))
			.where(eq(invoices.id, data.id))
			.limit(1);

		if (invoice.length === 0) {
			throw new Error("Invoice not found");
		}

		const items = await db
			.select({
				id: invoiceItems.id,
				productId: invoiceItems.productId,
				productName: products.name,
				quantity: invoiceItems.quantity,
				unitPrice: invoiceItems.unitPrice,
				total: invoiceItems.total,
			})
			.from(invoiceItems)
			.innerJoin(products, eq(invoiceItems.productId, products.id))
			.where(eq(invoiceItems.invoiceId, data.id));

		return {
			...invoice[0],
			items,
		};
	});

export const voidInvoiceFn = createServerFn({ method: "POST" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		const invoice = await db
			.select()
			.from(invoices)
			.where(eq(invoices.id, data.id))
			.limit(1);

		if (invoice.length === 0) {
			throw new Error("Invoice not found");
		}

		await db
			.update(invoices)
			.set({ voidedAt: new Date() })
			.where(eq(invoices.id, data.id));

		const items = await db
			.select()
			.from(invoiceItems)
			.where(eq(invoiceItems.invoiceId, data.id));

		for (const item of items) {
			await db.insert(stockAdjustments).values({
				productId: item.productId,
				quantityChange: item.quantity,
				reason: `Void - ${invoice[0].invoiceNumber}`,
				adjustedBy: invoice[0].userId,
			});

			await db
				.update(products)
				.set({ updatedAt: new Date() })
				.where(eq(products.id, item.productId));
		}

		return { success: true };
	});
