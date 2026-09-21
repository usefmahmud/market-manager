import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarSeparator,
} from "#/lib/components/ui/sidebar";
import { useAuth } from "#/lib/hooks/useAuth";
import { SidebarNav } from "./sidebar-nav";

export function AppSidebar() {
	const { user } = useAuth();

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center gap-2 px-4 py-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<span className="text-sm font-bold">MM</span>
					</div>
					<span className="text-lg font-semibold">Market Manager</span>
				</div>
			</SidebarHeader>
			<SidebarSeparator />
			<SidebarContent>
				<SidebarNav userRole={user?.role} />
			</SidebarContent>
			<SidebarFooter>
				<SidebarSeparator />
				<div className="px-4 py-2">
					<p className="text-sm font-medium">{user?.name}</p>
					<p className="text-xs text-muted-foreground">{user?.email}</p>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
