import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Badge } from "#/lib/components/ui/badge";
import { Button } from "#/lib/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/lib/components/ui/table";
import { useDeleteProduct } from "../hooks/use-products";
import { ProductDialog } from "./product-dialog";

interface Product {
	id: number;
	name: string;
	barcode: string | null;
	categoryId: number | null;
	price: string;
	unit: string | null;
	description: string | null;
	categoryName: string | null;
}

interface ProductTableProps {
	products: Product[];
	categories: { id: number; name: string }[];
}

export function ProductTable({ products, categories }: ProductTableProps) {
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
	const deleteProduct = useDeleteProduct();

	const handleDelete = () => {
		if (!deletingProduct) return;
		deleteProduct.mutate(
			{ id: deletingProduct.id },
			{ onSettled: () => setDeletingProduct(null) },
		);
	};

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Barcode</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>Price</TableHead>
						<TableHead>Unit</TableHead>
						<TableHead className="w-24">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{products.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={6}
								className="text-center text-muted-foreground"
							>
								No products found
							</TableCell>
						</TableRow>
					) : (
						products.map((product) => (
							<TableRow key={product.id}>
								<TableCell className="font-medium">{product.name}</TableCell>
								<TableCell className="font-mono text-sm">
									{product.barcode || "—"}
								</TableCell>
								<TableCell>
									<Badge variant="outline">
										{product.categoryName || "Uncategorized"}
									</Badge>
								</TableCell>
								<TableCell>${Number(product.price).toFixed(2)}</TableCell>
								<TableCell className="capitalize">
									{product.unit || "piece"}
								</TableCell>
								<TableCell>
									<div className="flex gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setEditingProduct(product)}
										>
											<Pencil className="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setDeletingProduct(product)}
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

			{editingProduct && (
				<ProductDialog
					product={editingProduct}
					categories={categories}
					open={!!editingProduct}
					onOpenChange={(open) => !open && setEditingProduct(null)}
				/>
			)}

			<AlertDialog
				open={!!deletingProduct}
				onOpenChange={(open) => !open && setDeletingProduct(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Product</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{deletingProduct?.name}"? This
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
