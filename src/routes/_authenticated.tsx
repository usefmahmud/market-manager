import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { meFromCookieFn } from "#/features/auth/api-client";
import { AppSidebar } from "#/features/layout/components/app-sidebar";
import { SidebarInset } from "#/lib/components/ui/sidebar";
import { Skeleton } from "#/lib/components/ui/skeleton";

interface AuthContext {
	user: { id: number; name: string; email: string; role: string };
}

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async (): Promise<AuthContext> => {
		try {
			const user = await meFromCookieFn();
			return { user };
		} catch {
			throw redirect({ to: "/login" });
		}
	},
	component: AuthenticatedLayout,
	pendingComponent: AuthLoading,
});

function AuthLoading() {
	return (
		<div className="flex h-screen w-full items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-32" />
			</div>
		</div>
	);
}

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
