import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuppliers } from "#/features/suppliers/hooks/use-suppliers";
import { SupplierTable } from "#/features/suppliers/components/supplier-table";
import { SupplierDialog } from "#/features/suppliers/components/supplier-dialog";
import { Button } from "#/lib/components/ui/button";
import { Skeleton } from "#/lib/components/ui/skeleton";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/suppliers/")({
	component: SuppliersPage,
});

function SuppliersPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const { data: suppliers, isLoading } = useSuppliers();

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Suppliers</h1>
				<Button onClick={() => setCreateOpen(true)}>
					<Plus className="mr-2 size-4" />
					Add Supplier
				</Button>
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-12 w-full" />
					))}
				</div>
			) : (
				<SupplierTable suppliers={suppliers ?? []} />
			)}

			<SupplierDialog open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
}
