import { redirect } from "@tanstack/react-router";
import { meFromCookieFn } from "#/features/auth/api-client";

export async function requireAdmin() {
	const user = await meFromCookieFn();
	if (user.role !== "admin") {
		throw redirect({ to: "/" });
	}
	return user;
}
