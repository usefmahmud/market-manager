import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "#/db";
import { users } from "#/db/schema";

export interface CreateUserParams {
	name: string;
	email: string;
	password: string;
	role?: string;
}

export async function createUser(params: CreateUserParams) {
	const existing = await db
		.select()
		.from(users)
		.where(eq(users.email, params.email))
		.limit(1);

	if (existing.length > 0) {
		throw new Error("Email already registered");
	}

	const passwordHash = await hash(params.password, 10);

	const newUser = await db
		.insert(users)
		.values({
			name: params.name,
			email: params.email,
			passwordHash,
			role: params.role ?? "cashier",
		})
		.returning();

	return newUser[0];
}
