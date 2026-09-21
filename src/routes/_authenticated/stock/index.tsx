import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStockLevels } from "#/features/stock/hooks/use-stock";
import { StockLevelTable } from "#/features/stock/components/stock-level-table";
import { StockAdjustmentDialog } from "#/features/stock/components/stock-adjustment-dialog";
import { Button } from "#/lib/components/ui/button";
import { Skeleton } from "#/lib/components/ui/skeleton";
import { Wrench } from "lucide-react";

export const Route = createFileRoute("/_authenticated/stock/")({
	component: StockPage,
});

function StockPage() {
	const [adjustingProduct, setAdjustingProduct] = useState<{
		id: number;
		name: string;
	} | null>(null);
	const { data: levels, isLoading } = useStockLevels();

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Stock Levels</h1>
				<Button
					onClick={() => {
						if (levels && levels.length > 0) {
							setAdjustingProduct({
								id: levels[0].productId,
								name: levels[0].productName,
							});
						}
					}}
				>
					<Wrench className="mr-2 size-4" />
					Adjust Stock
				</Button>
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-12 w-full" />
					))}
				</div>
			) : (
				<StockLevelTable levels={levels ?? []} />
			)}

			{adjustingProduct && (
				<StockAdjustmentDialog
					productId={adjustingProduct.id}
					productName={adjustingProduct.name}
					open={!!adjustingProduct}
					onOpenChange={(open) => !open && setAdjustingProduct(null)}
				/>
			)}
		</div>
	);
}
