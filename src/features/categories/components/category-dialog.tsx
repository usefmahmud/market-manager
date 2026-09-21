import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
	type CreateCategoryInput,
	createCategorySchema,
} from "#/features/categories/types";
import { Button } from "#/lib/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/lib/components/ui/dialog";
import { Input } from "#/lib/components/ui/input";
import { Label } from "#/lib/components/ui/label";
import { useCreateCategory, useUpdateCategory } from "../hooks/use-categories";

interface CategoryDialogProps {
	category?: { id: number; name: string; description: string | null };
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CategoryDialog({
	category,
	open,
	onOpenChange,
}: CategoryDialogProps) {
	const isEditing = !!category;
	const createCategory = useCreateCategory();
	const updateCategory = useUpdateCategory();

	const form = useForm<CreateCategoryInput>({
		resolver: zodResolver(createCategorySchema),
		defaultValues: {
			name: category?.name ?? "",
			description: category?.description ?? "",
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				name: category?.name ?? "",
				description: category?.description ?? "",
			});
		}
	}, [open, category, form]);

	const onSubmit = (data: CreateCategoryInput) => {
		if (isEditing) {
			updateCategory.mutate(
				{ id: category.id, ...data },
				{ onSettled: () => onOpenChange(false) },
			);
		} else {
			createCategory.mutate(data, {
				onSettled: () => onOpenChange(false),
			});
		}
	};

	const isPending = createCategory.isPending || updateCategory.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Category" : "Create Category"}
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
