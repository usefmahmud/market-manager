import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CategoryDialog } from "#/features/categories/components/category-dialog";
import { CategoryTable } from "#/features/categories/components/category-table";
import { useCategories } from "#/features/categories/hooks/use-categories";
import { Button } from "#/lib/components/ui/button";
import { Skeleton } from "#/lib/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/categories/")({
	component: CategoriesPage,
});

function CategoriesPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const { data: categories, isLoading } = useCategories();

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Categories</h1>
				<Button onClick={() => setCreateOpen(true)}>
					<Plus className="mr-2 size-4" />
					Add Category
				</Button>
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-12 w-full" />
					))}
				</div>
			) : (
				<CategoryTable categories={categories ?? []} />
			)}

			<CategoryDialog open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
}
