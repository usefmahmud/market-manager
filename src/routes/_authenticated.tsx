import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { meFromCookieFn } from "#/features/auth/api-client";
import { AppSidebar } from "#/features/layout/components/app-sidebar";
import { SidebarInset } from "#/lib/components/ui/sidebar";

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
	return (
		<>
			<AppSidebar />
			<SidebarInset>
				<Outlet />
			</SidebarInset>
		</>
	);
}
