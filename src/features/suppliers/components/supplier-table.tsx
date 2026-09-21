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
import { Button } from "#/lib/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/lib/components/ui/table";
import { useDeleteSupplier } from "../hooks/use-suppliers";
import { SupplierDialog } from "./supplier-dialog";

interface Supplier {
	id: number;
	name: string;
	contactPerson: string | null;
	phone: string | null;
	email: string | null;
	address: string | null;
}

interface SupplierTableProps {
	suppliers: Supplier[];
}

export function SupplierTable({ suppliers }: SupplierTableProps) {
	const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
	const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(
		null,
	);
	const deleteSupplier = useDeleteSupplier();

	const handleDelete = () => {
		if (!deletingSupplier) return;
		deleteSupplier.mutate(
			{ id: deletingSupplier.id },
			{ onSettled: () => setDeletingSupplier(null) },
		);
	};

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Contact</TableHead>
						<TableHead>Phone</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Address</TableHead>
						<TableHead className="w-24">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{suppliers.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={6}
								className="text-center text-muted-foreground"
							>
								No suppliers found
							</TableCell>
						</TableRow>
					) : (
						suppliers.map((supplier) => (
							<TableRow key={supplier.id}>
								<TableCell className="font-medium">{supplier.name}</TableCell>
								<TableCell>{supplier.contactPerson || "—"}</TableCell>
								<TableCell>{supplier.phone || "—"}</TableCell>
								<TableCell>{supplier.email || "—"}</TableCell>
								<TableCell className="max-w-[200px] truncate">
									{supplier.address || "—"}
								</TableCell>
								<TableCell>
									<div className="flex gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setEditingSupplier(supplier)}
										>
											<Pencil className="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setDeletingSupplier(supplier)}
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

			{editingSupplier && (
				<SupplierDialog
					supplier={editingSupplier}
					open={!!editingSupplier}
					onOpenChange={(open) => !open && setEditingSupplier(null)}
				/>
			)}

			<AlertDialog
				open={!!deletingSupplier}
				onOpenChange={(open) => !open && setDeletingSupplier(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Supplier</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{deletingSupplier?.name}"? This
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
