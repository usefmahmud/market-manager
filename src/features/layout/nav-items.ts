import {
	LayoutDashboard,
	Package,
	FolderTree,
	BarChart3,
	Truck,
	Receipt,
	CreditCard,
	BarChart,
	Settings,
} from "lucide-react";

export interface NavItem {
	title: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	adminOnly?: boolean;
}

export const navItems: NavItem[] = [
	{ title: "Dashboard", href: "/", icon: LayoutDashboard },
	{ title: "Products", href: "/products", icon: Package },
	{ title: "Categories", href: "/categories", icon: FolderTree },
	{ title: "Stock", href: "/stock", icon: BarChart3 },
	{ title: "Suppliers", href: "/suppliers", icon: Truck },
	{ title: "Invoices", href: "/invoices", icon: Receipt },
	{ title: "Checkout", href: "/checkout", icon: CreditCard },
	{ title: "Analytics", href: "/analytics", icon: BarChart, adminOnly: true },
	{ title: "Settings", href: "/settings", icon: Settings },
];
