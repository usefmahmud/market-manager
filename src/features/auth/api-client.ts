import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { verifySession } from "#/lib/auth";
import { db } from "#/db";
import { users } from "#/db/schema";
import { eq } from "drizzle-orm";

export const setSessionCookieFn = createServerFn({ method: "POST" })
	.validator((input: { token: string }) => input)
	.handler(async ({ data }) => {
		const maxAge = 60 * 60 * 24 * 7; // 7 days
		setCookie("session", data.token, { path: "/", maxAge });
		return { success: true };
	});

export const clearSessionCookieFn = createServerFn({ method: "POST" }).handler(
	async () => {
		deleteCookie("session", { path: "/" });
		return { success: true };
	},
);

export const meFromCookieFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const token = getCookie("session");
		if (!token) {
			throw new Error("Not authenticated");
		}

		const session = await verifySession(token);
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
	},
);
