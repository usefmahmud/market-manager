import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarSeparator,
} from "#/lib/components/ui/sidebar";
import { useAuth } from "#/lib/hooks/useAuth";
import { Button } from "#/lib/components/ui/button";
import { SidebarNav } from "./sidebar-nav";

export function AppSidebar() {
	const { user, logout } = useAuth();
	const { theme, setTheme } = useTheme();

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
				<div className="flex items-center justify-between px-4 py-2">
					<div>
						<p className="text-sm font-medium">{user?.name}</p>
						<p className="text-xs text-muted-foreground">{user?.email}</p>
					</div>
					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="size-8"
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						>
							<Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
							<span className="sr-only">Toggle theme</span>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="size-8"
							onClick={() => logout()}
						>
							<LogOut className="size-4" />
							<span className="sr-only">Logout</span>
						</Button>
					</div>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
