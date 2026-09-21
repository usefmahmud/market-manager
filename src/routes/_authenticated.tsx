import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { meFromCookieFn } from "#/features/auth/api-client";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async () => {
		try {
			await meFromCookieFn();
		} catch {
			throw redirect({ to: "/login" });
		}
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	return <Outlet />;
}
