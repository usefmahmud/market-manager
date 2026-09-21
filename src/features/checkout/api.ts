import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import { db } from "#/db";
import { invoiceItems, invoices, products, stockAdjustments, stockBatches } from "#/db/schema";
import { checkoutSchema } from "./types";

async function generateInvoiceNumber(): Promise<string> {
	const lastInvoice = await db
		.select({ invoiceNumber: invoices.invoiceNumber })
		.from(invoices)
		.orderBy(sql`${invoices.id} desc`)
		.limit(1);

	if (lastInvoice.length === 0) {
		return "INV-000001";
	}

	const lastNumber = Number.parseInt(
		lastInvoice[0].invoiceNumber.split("-")[1],
		10,
	);
	const nextNumber = lastNumber + 1;
	return `INV-${nextNumber.toString().padStart(6, "0")}`;
}

async function getProductStock(productId: number): Promise<number> {
	const batchStock = await db
		.select({
			total: sql<number>`coalesce(sum(${stockBatches.quantity}), 0)`,
		})
		.from(stockBatches)
		.where(eq(stockBatches.productId, productId));

	const adjustmentStock = await db
		.select({
			total: sql<number>`coalesce(sum(${stockAdjustments.quantityChange}), 0)`,
		})
		.from(stockAdjustments)
		.where(eq(stockAdjustments.productId, productId));

	return (batchStock[0]?.total ?? 0) + (adjustmentStock[0]?.total ?? 0);
}

export const createInvoiceFn = createServerFn({ method: "POST" })
	.validator(checkoutSchema)
	.handler(async ({ data }) => {
		for (const item of data.items) {
			const stock = await getProductStock(item.productId);
			if (stock < item.quantity) {
				const product = await db
					.select({ name: products.name })
					.from(products)
					.where(eq(products.id, item.productId))
					.limit(1);
				const productName = product[0]?.name ?? "Unknown";
				throw new Error(
					`Insufficient stock for ${productName} (available: ${stock})`,
				);
			}
		}

		const invoiceNumber = await generateInvoiceNumber();

		let paymentMethod: string = data.paymentMethod;
		if (data.paymentMethod === "mixed" && data.cashAmount != null && data.cardAmount != null) {
			paymentMethod = `mixed:${data.cashAmount.toFixed(2)}:${data.cardAmount.toFixed(2)}`;
		}

		const newInvoice = await db
			.insert(invoices)
			.values({
				invoiceNumber,
				userId: data.userId,
				paymentMethod,
				subtotal: data.subtotal,
				tax: "0.00",
				total: data.total,
			})
			.returning();

		const invoiceItemsData = data.items.map((item) => ({
			invoiceId: newInvoice[0].id,
			productId: item.productId,
			quantity: item.quantity,
			unitPrice: item.unitPrice,
			total: (Number.parseFloat(item.unitPrice) * item.quantity).toFixed(2),
		}));

		await db.insert(invoiceItems).values(invoiceItemsData);

		for (const item of data.items) {
			await db
				.insert(stockAdjustments)
				.values({
					productId: item.productId,
					quantityChange: -item.quantity,
					reason: `Sale - ${invoiceNumber}`,
					adjustedBy: data.userId,
				});

			await db
				.update(products)
				.set({ updatedAt: new Date() })
				.where(eq(products.id, item.productId));
		}

		return {
			invoice: newInvoice[0],
			items: invoiceItemsData,
		};
	});
