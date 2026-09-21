import { useQuery } from "@tanstack/react-query";
import { getInvoicesFn } from "#/features/invoices/api";
import { getProductsFn } from "#/features/products/api";
import { getStockLevelsFn } from "#/features/stock/api";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "#/lib/components/ui/card";
import { Skeleton } from "#/lib/components/ui/skeleton";

export function StatsCards() {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<StatsCard title="Total Products" queryKey={["products", "count"]}>
				{({ data, isLoading }) => {
					if (isLoading) return <Skeleton className="h-8 w-20" />;
					const count = Array.isArray(data) ? data.length : 0;
					return <div className="text-2xl font-bold">{count}</div>;
				}}
			</StatsCard>
			<StatsCard title="Low Stock Items" queryKey={["stock", "low"]}>
				{({ data, isLoading }) => {
					if (isLoading) return <Skeleton className="h-8 w-20" />;
					const lowStock = (Array.isArray(data) ? data : []).filter(
						(s: { totalQuantity: number }) => s.totalQuantity < 10,
					);
					return (
						<div className="text-2xl font-bold text-destructive">
							{lowStock.length}
						</div>
					);
				}}
			</StatsCard>
			<StatsCard title="Today's Sales" queryKey={["invoices", "today"]}>
				{({ data, isLoading }) => {
					if (isLoading) return <Skeleton className="h-8 w-20" />;
					const today = new Date().toISOString().split("T")[0];
					const todayInvoices = (Array.isArray(data) ? data : []).filter(
						(inv: { createdAt: string }) => inv.createdAt?.startsWith(today),
					);
					return (
						<div className="text-2xl font-bold">{todayInvoices.length}</div>
					);
				}}
			</StatsCard>
			<StatsCard title="Total Revenue" queryKey={["invoices", "revenue"]}>
				{({ data, isLoading }) => {
					if (isLoading) return <Skeleton className="h-8 w-20" />;
					const revenue = (Array.isArray(data) ? data : []).reduce(
						(sum: number, inv: { total: string }) =>
							sum + Number(inv.total ?? 0),
						0,
					);
					return (
						<div className="text-2xl font-bold">
							${revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
						</div>
					);
				}}
			</StatsCard>
		</div>
	);
}

function StatsCard({
	title,
	queryKey,
	children,
}: {
	title: string;
	queryKey: string[];
// biome-ignore lint/suspicious/noExplicitAny: dynamic data from different queries
	children: React.ComponentType<{ data: any; isLoading: boolean }>;
}) {
	const { data, isLoading } = useQuery({
		queryKey,
		queryFn: () => queryForCard(queryKey),
	});
	const Content = children;

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<Content data={data} isLoading={isLoading} />
			</CardContent>
		</Card>
	);
}

async function queryForCard(queryKey: string[]) {
	const key = queryKey.join("/");
	if (key === "products/count") return getProductsFn({ data: {} });
	if (key === "stock/low") return getStockLevelsFn({ data: undefined });
	if (key === "invoices/today") return getInvoicesFn({ data: {} });
	if (key === "invoices/revenue") return getInvoicesFn({ data: {} });
	return [];
}
