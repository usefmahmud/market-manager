import { createServerFn } from "@tanstack/react-start";
import { hash } from "bcryptjs";
import { desc, eq } from "drizzle-orm";
import { db } from "#/db";
import { users } from "#/db/schema";
import { deleteRecord } from "#/lib/db-helpers";
import { createUser } from "#/lib/user-helpers";
import { createUserSchema, updateUserSchema } from "./types";

export const getUsersFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const allUsers = await db
			.select()
			.from(users)
			.orderBy(desc(users.createdAt));
		return allUsers.map(({ passwordHash, ...user }) => user);
	},
);

export const getUserFn = createServerFn({ method: "GET" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.id, data.id))
			.limit(1);

		if (user.length === 0) {
			throw new Error("User not found");
		}

		const { passwordHash, ...rest } = user[0];
		return rest;
	});

export const createUserFn = createServerFn({ method: "POST" })
	.validator(createUserSchema)
	.handler(async ({ data }) => {
		const newUser = await createUser({
			name: data.name,
			email: data.email,
			password: data.password,
			role: data.role,
		});

		const { passwordHash: _, ...rest } = newUser;
		return rest;
	});

export const updateUserFn = createServerFn({ method: "POST" })
	.validator(updateUserSchema)
	.handler(async ({ data }) => {
		const { id, password, ...updates } = data;

		const updateData: Record<string, unknown> = {
			...updates,
			updatedAt: new Date(),
		};

		if (password) {
			updateData.passwordHash = await hash(password, 10);
		}

		const updated = await db
			.update(users)
			.set(updateData)
			.where(eq(users.id, id))
			.returning();

		if (updated.length === 0) {
			throw new Error("User not found");
		}

		const { passwordHash, ...rest } = updated[0];
		return rest;
	});

export const deleteUserFn = createServerFn({ method: "POST" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		return deleteRecord({
			tableName: "User",
			id: data.id,
			table: users,
			errorMessage: "User not found",
		});
	});
