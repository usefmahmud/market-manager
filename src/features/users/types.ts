import { z } from "zod";

export const createUserSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	role: z.enum(["admin", "cashier"]).default("cashier"),
});

export const updateUserSchema = z.object({
	id: z.number(),
	name: z.string().min(2).optional(),
	email: z.string().email().optional(),
	password: z.string().min(6).optional(),
	role: z.enum(["admin", "cashier"]).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export interface User {
	id: number;
	name: string;
	email: string;
	role: string;
	createdAt: Date | null;
}
