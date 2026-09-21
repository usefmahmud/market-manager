import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	createSupplierSchema,
	type CreateSupplierInput,
} from "#/features/suppliers/types";
import { useCreateSupplier, useUpdateSupplier } from "../hooks/use-suppliers";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/lib/components/ui/dialog";
import { Button } from "#/lib/components/ui/button";
import { Input } from "#/lib/components/ui/input";
import { Label } from "#/lib/components/ui/label";

interface SupplierDialogProps {
	supplier?: {
		id: number;
		name: string;
		contactPerson: string | null;
		phone: string | null;
		email: string | null;
		address: string | null;
	};
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SupplierDialog({
	supplier,
	open,
	onOpenChange,
}: SupplierDialogProps) {
	const isEditing = !!supplier;
	const createSupplier = useCreateSupplier();
	const updateSupplier = useUpdateSupplier();

	const form = useForm<CreateSupplierInput>({
		resolver: zodResolver(createSupplierSchema),
		defaultValues: {
			name: supplier?.name ?? "",
			contactPerson: supplier?.contactPerson ?? "",
			phone: supplier?.phone ?? "",
			email: supplier?.email ?? "",
			address: supplier?.address ?? "",
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				name: supplier?.name ?? "",
				contactPerson: supplier?.contactPerson ?? "",
				phone: supplier?.phone ?? "",
				email: supplier?.email ?? "",
				address: supplier?.address ?? "",
			});
		}
	}, [open, supplier, form]);

	const onSubmit = (data: CreateSupplierInput) => {
		if (isEditing) {
			updateSupplier.mutate(
				{ id: supplier.id, ...data },
				{ onSettled: () => onOpenChange(false) },
			);
		} else {
			createSupplier.mutate(data, {
				onSettled: () => onOpenChange(false),
			});
		}
	};

	const isPending = createSupplier.isPending || updateSupplier.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Supplier" : "Create Supplier"}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input id="name" {...form.register("name")} />
						{form.formState.errors.name && (
							<p className="text-sm text-destructive">
								{form.formState.errors.name.message}
							</p>
						)}
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="contactPerson">Contact Person</Label>
							<Input id="contactPerson" {...form.register("contactPerson")} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="phone">Phone</Label>
							<Input id="phone" {...form.register("phone")} />
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" {...form.register("email")} />
						{form.formState.errors.email && (
							<p className="text-sm text-destructive">
								{form.formState.errors.email.message}
							</p>
						)}
					</div>
					<div className="space-y-2">
						<Label htmlFor="address">Address</Label>
						<Input id="address" {...form.register("address")} />
					</div>
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Saving..." : isEditing ? "Update" : "Create"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
