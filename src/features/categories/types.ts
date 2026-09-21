import { z } from "zod";

export const categorySchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	parentId: z.number().nullable().optional(),
});

export const createCategorySchema = categorySchema;

export const updateCategorySchema = z.object({
	id: z.number(),
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	parentId: z.number().nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export interface Category {
	id: number;
	name: string;
	description: string | null;
	parentId: number | null;
	createdAt: Date | null;
}

export interface CategoryWithChildren extends Category {
	children?: CategoryWithChildren[];
	productCount?: number;
}
