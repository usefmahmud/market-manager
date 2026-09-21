import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	createProductSchema,
	type CreateProductInput,
} from "#/features/products/types";
import { useCreateProduct, useUpdateProduct } from "../hooks/use-products";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/lib/components/ui/dialog";
import { Button } from "#/lib/components/ui/button";
import { Input } from "#/lib/components/ui/input";
import { Label } from "#/lib/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/lib/components/ui/select";

interface ProductDialogProps {
	product?: {
		id: number;
		name: string;
		barcode: string | null;
		categoryId: number | null;
		price: string;
		unit: string | null;
		description: string | null;
	};
	categories: { id: number; name: string }[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

type FormValues = {
	name: string;
	price: string;
	barcode?: string;
	categoryId?: number | null;
	unit?: "piece" | "kg" | "liter";
	description?: string;
	image?: string;
};

export function ProductDialog({
	product,
	categories,
	open,
	onOpenChange,
}: ProductDialogProps) {
	const isEditing = !!product;
	const createProduct = useCreateProduct();
	const updateProduct = useUpdateProduct();

	const form = useForm<FormValues>({
		resolver: zodResolver(createProductSchema) as any,
		defaultValues: {
			name: product?.name ?? "",
			barcode: product?.barcode ?? "",
			categoryId: product?.categoryId ?? null,
			price: product?.price ?? "",
			unit: (product?.unit as "piece" | "kg" | "liter") ?? "piece",
			description: product?.description ?? "",
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				name: product?.name ?? "",
				barcode: product?.barcode ?? "",
				categoryId: product?.categoryId ?? null,
				price: product?.price ?? "",
				unit: (product?.unit as "piece" | "kg" | "liter") ?? "piece",
				description: product?.description ?? "",
			});
		}
	}, [open, product, form]);

	const onSubmit = (data: FormValues) => {
		const submitData: CreateProductInput = {
			name: data.name,
			price: data.price,
			unit: data.unit ?? "piece",
			barcode: data.barcode,
			categoryId: data.categoryId,
			description: data.description,
			image: data.image,
		};
		if (isEditing) {
			updateProduct.mutate(
				{ id: product.id, ...submitData },
				{ onSettled: () => onOpenChange(false) },
			);
		} else {
			createProduct.mutate(submitData, {
				onSettled: () => onOpenChange(false),
			});
		}
	};

	const isPending = createProduct.isPending || updateProduct.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Product" : "Create Product"}
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
							<Label htmlFor="barcode">Barcode</Label>
							<Input id="barcode" {...form.register("barcode")} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="price">Price</Label>
							<Input id="price" {...form.register("price")} placeholder="0.00" />
							{form.formState.errors.price && (
								<p className="text-sm text-destructive">
									{form.formState.errors.price.message}
								</p>
							)}
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Category</Label>
							<Select
								value={form.watch("categoryId")?.toString() ?? ""}
								onValueChange={(value) =>
									form.setValue("categoryId", value ? Number(value) : null)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									{categories.map((cat) => (
										<SelectItem key={cat.id} value={cat.id.toString()}>
											{cat.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Unit</Label>
							<Select
								value={form.watch("unit") ?? "piece"}
								onValueChange={(value) =>
									form.setValue("unit", value as "piece" | "kg" | "liter")
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="piece">Piece</SelectItem>
									<SelectItem value="kg">Kilogram</SelectItem>
									<SelectItem value="liter">Liter</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Input id="description" {...form.register("description")} />
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
