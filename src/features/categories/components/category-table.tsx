import { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/lib/components/ui/table";
import { Button } from "#/lib/components/ui/button";
import { Badge } from "#/lib/components/ui/badge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#/lib/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { useDeleteCategory } from "../hooks/use-categories";
import { CategoryDialog } from "./category-dialog";

interface Category {
	id: number;
	name: string;
	description: string | null;
	productCount: number;
}

interface CategoryTableProps {
	categories: Category[];
}

export function CategoryTable({ categories }: CategoryTableProps) {
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
	const deleteCategory = useDeleteCategory();

	const handleDelete = () => {
		if (!deletingCategory) return;
		deleteCategory.mutate(
			{ id: deletingCategory.id },
			{ onSettled: () => setDeletingCategory(null) },
		);
	};

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Description</TableHead>
						<TableHead>Products</TableHead>
						<TableHead className="w-24">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{categories.length === 0 ? (
						<TableRow>
							<TableCell colSpan={4} className="text-center text-muted-foreground">
								No categories found
							</TableCell>
						</TableRow>
					) : (
						categories.map((category) => (
							<TableRow key={category.id}>
								<TableCell className="font-medium">{category.name}</TableCell>
								<TableCell className="text-muted-foreground">
									{category.description || "—"}
								</TableCell>
								<TableCell>
									<Badge variant="secondary">{category.productCount}</Badge>
								</TableCell>
								<TableCell>
									<div className="flex gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setEditingCategory(category)}
										>
											<Pencil className="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setDeletingCategory(category)}
										>
											<Trash2 className="size-4 text-destructive" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			{editingCategory && (
				<CategoryDialog
					category={editingCategory}
					open={!!editingCategory}
					onOpenChange={(open) => !open && setEditingCategory(null)}
				/>
			)}

			<AlertDialog
				open={!!deletingCategory}
				onOpenChange={(open) => !open && setDeletingCategory(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Category</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{deletingCategory?.name}"? This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
