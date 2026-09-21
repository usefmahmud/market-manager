import { z } from "zod";

export const receiveBatchSchema = z.object({
	productId: z.number(),
	supplierId: z.number().nullable().optional(),
	batchNumber: z.string().optional(),
	quantity: z.number().int().positive("Quantity must be positive"),
	expiryDate: z.string().datetime().optional(),
	purchasePrice: z
		.string()
		.regex(/^\d+(\.\d{1,2})?$/, "Invalid price")
		.optional(),
	receivedBy: z.number(),
});

export const adjustStockSchema = z.object({
	productId: z.number(),
	quantityChange: z.number().int(),
	reason: z.string().min(1, "Reason is required"),
	adjustedBy: z.number(),
});

export type ReceiveBatchInput = z.infer<typeof receiveBatchSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;

export interface StockLevel {
	productId: number;
	productName: string;
	barcode: string | null;
	totalQuantity: number;
}

export interface StockHistoryItem {
	id: number;
	type: "batch" | "adjustment";
	productId: number;
	productName: string;
	quantity: number;
	reason: string | null;
	batchNumber: string | null;
	userName: string | null;
	createdAt: Date | null;
}
