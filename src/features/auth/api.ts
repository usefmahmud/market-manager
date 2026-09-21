import { createServerFn } from "@tanstack/react-start";
import { setCookie, deleteCookie } from "@tanstack/react-start/server";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "#/db";
import { users } from "#/db/schema";
import { createSession, verifySession } from "#/lib/auth";
import { createUser } from "#/lib/user-helpers";
import { loginSchema, registerSchema } from "./types";

export const loginFn = createServerFn({ method: "POST" })
	.validator(loginSchema)
	.handler(async ({ data }) => {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.email, data.email))
			.limit(1);

		if (user.length === 0) {
			throw new Error("Invalid email or password");
		}

		const valid = await compare(data.password, user[0].passwordHash);
		if (!valid) {
			throw new Error("Invalid email or password");
		}

		const token = await createSession({
			userId: user[0].id,
			email: user[0].email,
			role: user[0].role,
		});

		const maxAge = 60 * 60 * 24 * 7; // 7 days
		setCookie("session", token, { path: "/", maxAge });

		return {
			token,
			user: {
				id: user[0].id,
				name: user[0].name,
				email: user[0].email,
				role: user[0].role,
			},
		};
	});

export const registerFn = createServerFn({ method: "POST" })
	.validator(registerSchema)
	.handler(async ({ data }) => {
		const newUser = await createUser({
			name: data.name,
			email: data.email,
			password: data.password,
			role: data.role,
		});

		const token = await createSession({
			userId: newUser.id,
			email: newUser.email,
			role: newUser.role,
		});

		return {
			token,
			user: {
				id: newUser.id,
				name: newUser.name,
				email: newUser.email,
				role: newUser.role,
			},
		};
	});

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
	deleteCookie("session", { path: "/" });
	return { success: true };
});

export const meFn = createServerFn({ method: "GET" })
	.validator((input: { token: string }) => input)
	.handler(async ({ data }) => {
		const session = await verifySession(data.token);

		if (!session) {
			throw new Error("Not authenticated");
		}

		const user = await db
			.select()
			.from(users)
			.where(eq(users.id, session.userId))
			.limit(1);

		if (user.length === 0) {
			throw new Error("User not found");
		}

		return {
			id: user[0].id,
			name: user[0].name,
			email: user[0].email,
			role: user[0].role,
		};
	});
