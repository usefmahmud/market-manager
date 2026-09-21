import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/lib/components/ui/table";
import { requireAdmin } from "#/lib/auth-guard";

export const Route = createFileRoute("/_authenticated/analytics/")({
	beforeLoad: requireAdmin,
	component: AnalyticsPage,
});

function AnalyticsPage() {
	const { data: invoices, isLoading: invoicesLoading } = useQuery({
		queryKey: ["invoices", "analytics"],
		queryFn: () => getInvoicesFn({ data: {} }),
	});

	const { data: stockLevels, isLoading: stockLoading } = useQuery({
		queryKey: ["stock", "analytics"],
		queryFn: () => getStockLevelsFn({ data: undefined }),
	});

	const { data: products, isLoading: productsLoading } = useQuery({
		queryKey: ["products", "analytics"],
		queryFn: () => getProductsFn({ data: {} }),
	});

	const isLoading = invoicesLoading || stockLoading || productsLoading;

	const totalRevenue = (invoices ?? []).reduce(
		(sum: number, inv: { total: string }) => sum + Number(inv.total ?? 0),
		0,
	);

	const totalProducts = (products ?? []).length;
	const lowStockCount = (stockLevels ?? []).filter(
		(s: { totalQuantity: number }) => s.totalQuantity < 10,
	).length;

	const topProducts = (products ?? [])
		.sort((a: { name: string }, b: { name: string }) =>
			a.name.localeCompare(b.name),
		)
		.slice(0, 5);

	return (
		<div className="space-y-6 p-6">
			<h1 className="text-3xl font-bold">Analytics</h1>

			{isLoading ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-32 w-full" />
					))}
				</div>
			) : (
				<>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Revenue
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									$
									{totalRevenue.toLocaleString("en-US", {
										minimumFractionDigits: 2,
									})}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Invoices
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{(invoices ?? []).length}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Products
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalProducts}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Low Stock Items
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-destructive">
									{lowStockCount}
								</div>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Products Overview</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Barcode</TableHead>
										<TableHead>Price</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{topProducts.map((product: { id: number; name: string; barcode: string | null; price: string }) => (
										<TableRow key={product.id}>
											<TableCell className="font-medium">
												{product.name}
											</TableCell>
											<TableCell className="font-mono text-sm">
												{product.barcode || "—"}
											</TableCell>
											<TableCell>${Number(product.price).toFixed(2)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
