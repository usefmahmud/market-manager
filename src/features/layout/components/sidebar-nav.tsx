import { useLocation, Link } from "@tanstack/react-router";
import {
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "#/lib/components/ui/sidebar";
import { navItems, type NavItem } from "../nav-items";

interface SidebarNavProps {
	userRole?: string;
}

export function SidebarNav({ userRole }: SidebarNavProps) {
	const location = useLocation();

	const filteredItems = navItems.filter(
		(item) => !item.adminOnly || userRole === "admin",
	);

	return (
		<SidebarMenu>
			{filteredItems.map((item) => (
				<SidebarNavItem key={item.href} item={item} pathname={location.pathname} />
			))}
		</SidebarMenu>
	);
}

function SidebarNavItem({
	item,
	pathname,
}: { item: NavItem; pathname: string }) {
	const isActive =
		item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild isActive={isActive}>
				<Link to={item.href}>
					<item.icon className="size-4" />
					<span>{item.title}</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}
