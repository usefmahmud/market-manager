import { redirect } from "@tanstack/react-router";
import { meFromCookieFn } from "#/features/auth/api-client";

export async function requireAdmin() {
	try {
		const user = await meFromCookieFn();
		if (user.role !== "admin") {
			throw redirect({ to: "/" });
		}
		return user;
	} catch (error) {
		if (error && typeof error === "object" && "isRedirect" in error) {
			throw error;
		}
		throw redirect({ to: "/login" });
	}
}
