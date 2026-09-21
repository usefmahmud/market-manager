import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useCategories } from "#/features/categories/hooks/use-categories";
import { ProductDialog } from "#/features/products/components/product-dialog";
import { ProductTable } from "#/features/products/components/product-table";
import { useProducts } from "#/features/products/hooks/use-products";
import { Button } from "#/lib/components/ui/button";
import { Input } from "#/lib/components/ui/input";
import { Skeleton } from "#/lib/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/products/")({
	component: ProductsPage,
});

function ProductsPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const [search, setSearch] = useState("");
	const { data: products, isLoading } = useProducts({ search });
	const { data: categories } = useCategories();

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Products</h1>
				<Button onClick={() => setCreateOpen(true)}>
					<Plus className="mr-2 size-4" />
					Add Product
				</Button>
			</div>

			<div className="flex items-center gap-2">
				<Search className="size-4 text-muted-foreground" />
				<Input
					placeholder="Search products..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="max-w-sm"
				/>
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-12 w-full" />
					))}
				</div>
			) : (
				<ProductTable products={products ?? []} categories={categories ?? []} />
			)}

			<ProductDialog
				categories={categories ?? []}
				open={createOpen}
				onOpenChange={setCreateOpen}
			/>
		</div>
	);
}
