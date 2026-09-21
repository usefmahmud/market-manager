import { z } from "zod";

export const invoiceFilterSchema = z.object({
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	userId: z.number().optional(),
	paymentMethod: z.enum(["cash", "card", "mixed"]).optional(),
});

export type InvoiceFilterInput = z.infer<typeof invoiceFilterSchema>;

export interface InvoiceListItem {
	id: number;
	invoiceNumber: string;
	userId: number;
	userName: string | null;
	paymentMethod: string;
	subtotal: string;
	tax: string;
	total: string;
	itemCount: number;
	voidedAt: Date | null;
	createdAt: Date | null;
}

export interface InvoiceDetail {
	id: number;
	invoiceNumber: string;
	userId: number;
	userName: string | null;
	paymentMethod: string;
	subtotal: string;
	tax: string;
	total: string;
	voidedAt: Date | null;
	createdAt: Date | null;
	items: InvoiceItemDetail[];
}

export interface InvoiceItemDetail {
	id: number;
	productId: number;
	productName: string;
	quantity: number;
	unitPrice: string;
	total: string;
}
