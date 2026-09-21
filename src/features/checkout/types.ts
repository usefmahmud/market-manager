import { z } from "zod";

export const checkoutItemSchema = z.object({
	productId: z.number(),
	quantity: z.number().int().positive(),
	unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

export const checkoutSchema = z.object({
	userId: z.number(),
	paymentMethod: z.enum(["cash", "card", "mixed"]),
	items: z.array(checkoutItemSchema).min(1, "At least one item required"),
	subtotal: z.string().regex(/^\d+(\.\d{1,2})?$/),
	tax: z.string().regex(/^\d+(\.\d{1,2})?$/),
	total: z.string().regex(/^\d+(\.\d{1,2})?$/),
	cashAmount: z.number().optional(),
	cardAmount: z.number().optional(),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export interface Invoice {
	id: number;
	invoiceNumber: string;
	userId: number;
	paymentMethod: string;
	subtotal: string;
	tax: string;
	total: string;
	createdAt: Date | null;
}

export interface InvoiceItem {
	id: number;
	invoiceId: number;
	productId: number;
	quantity: number;
	unitPrice: string;
	total: string;
}
