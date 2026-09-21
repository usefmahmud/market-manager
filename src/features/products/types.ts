import { z } from "zod";

export const productSchema = z.object({
	name: z.string().min(1, "Name is required"),
	barcode: z.string().optional(),
	categoryId: z.number().nullable().optional(),
	price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
	unit: z.enum(["piece", "kg", "liter"]).default("piece"),
	description: z.string().optional(),
	image: z.string().url("Invalid URL").optional(),
});

export const createProductSchema = productSchema;

export const updateProductSchema = z.object({
	id: z.number(),
	name: z.string().min(1).optional(),
	barcode: z.string().optional(),
	categoryId: z.number().nullable().optional(),
	price: z
		.string()
		.regex(/^\d+(\.\d{1,2})?$/)
		.optional(),
	unit: z.enum(["piece", "kg", "liter"]).optional(),
	description: z.string().optional(),
	image: z.string().url().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export interface Product {
	id: number;
	name: string;
	barcode: string | null;
	categoryId: number | null;
	price: string;
	unit: string | null;
	description: string | null;
	image: string | null;
	createdAt: Date | null;
	updatedAt: Date | null;
}

export interface ProductWithCategory extends Product {
	categoryName?: string;
}
