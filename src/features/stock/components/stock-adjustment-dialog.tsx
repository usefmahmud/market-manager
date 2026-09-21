import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
	type AdjustStockInput,
	adjustStockSchema,
} from "#/features/stock/types";
import { Button } from "#/lib/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/lib/components/ui/dialog";
import { Input } from "#/lib/components/ui/input";
import { Label } from "#/lib/components/ui/label";
import { useAuth } from "#/lib/hooks/useAuth";
import { useAdjustStock } from "../hooks/use-stock";

interface StockAdjustmentDialogProps {
	productId: number;
	productName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function StockAdjustmentDialog({
	productId,
	productName,
	open,
	onOpenChange,
}: StockAdjustmentDialogProps) {
	const { user } = useAuth();
	const adjustStock = useAdjustStock();

	const form = useForm<AdjustStockInput>({
		resolver: zodResolver(adjustStockSchema),
		defaultValues: {
			productId,
			quantityChange: 0,
			reason: "",
			adjustedBy: user?.id ?? 0,
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				productId,
				quantityChange: 0,
				reason: "",
				adjustedBy: user?.id ?? 0,
			});
		}
	}, [open, productId, user, form]);

	const onSubmit = (data: AdjustStockInput) => {
		adjustStock.mutate(data, {
			onSettled: () => onOpenChange(false),
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Adjust Stock: {productName}</DialogTitle>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="quantityChange">
							Quantity Change (negative to reduce)
						</Label>
						<Input
							id="quantityChange"
							type="number"
							{...form.register("quantityChange", { valueAsNumber: true })}
						/>
						{form.formState.errors.quantityChange && (
							<p className="text-sm text-destructive">
								{form.formState.errors.quantityChange.message}
							</p>
						)}
					</div>
					<div className="space-y-2">
						<Label htmlFor="reason">Reason</Label>
						<Input id="reason" {...form.register("reason")} />
						{form.formState.errors.reason && (
							<p className="text-sm text-destructive">
								{form.formState.errors.reason.message}
							</p>
						)}
					</div>
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={adjustStock.isPending}>
							{adjustStock.isPending ? "Saving..." : "Adjust"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
