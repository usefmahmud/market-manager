import { z } from "zod";

export const supplierSchema = z.object({
	name: z.string().min(1, "Name is required"),
	contactPerson: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email("Invalid email").optional().or(z.literal("")),
	address: z.string().optional(),
});

export const createSupplierSchema = supplierSchema;

export const updateSupplierSchema = z.object({
	id: z.number(),
	name: z.string().min(1).optional(),
	contactPerson: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email().optional().or(z.literal("")),
	address: z.string().optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;

export interface Supplier {
	id: number;
	name: string;
	contactPerson: string | null;
	phone: string | null;
	email: string | null;
	address: string | null;
	createdAt: Date | null;
}
