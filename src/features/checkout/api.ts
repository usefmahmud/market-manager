import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import { db } from "#/db";
import { invoiceItems, invoices, products } from "#/db/schema";
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

export const createInvoiceFn = createServerFn({ method: "POST" })
	.validator(checkoutSchema)
	.handler(async ({ data }) => {
		const invoiceNumber = await generateInvoiceNumber();

		const newInvoice = await db
			.insert(invoices)
			.values({
				invoiceNumber,
				userId: data.userId,
				paymentMethod: data.paymentMethod,
				subtotal: data.subtotal,
				tax: data.tax,
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
				.update(products)
				.set({ updatedAt: new Date() })
				.where(eq(products.id, item.productId));
		}

		return {
			invoice: newInvoice[0],
			items: invoiceItemsData,
		};
	});
