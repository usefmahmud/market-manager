import { useState } from "react";
import { Button } from "#/lib/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/lib/components/ui/dialog";
import { Input } from "#/lib/components/ui/input";
import { Label } from "#/lib/components/ui/label";

interface MixedPaymentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	total: number;
	onConfirm: (cashAmount: number, cardAmount: number) => void;
}

export function MixedPaymentDialog({
	open,
	onOpenChange,
	total,
	onConfirm,
}: MixedPaymentDialogProps) {
	const [cashAmount, setCashAmount] = useState("");
	const [cardAmount, setCardAmount] = useState("");

	const cash = Number.parseFloat(cashAmount) || 0;
	const card = Number.parseFloat(cardAmount) || 0;
	const isValid = cash + card === total && cash >= 0 && card >= 0;

	const handleCashChange = (value: string) => {
		setCashAmount(value);
		const cashVal = Number.parseFloat(value) || 0;
		setCardAmount((total - cashVal).toFixed(2));
	};

	const handleCardChange = (value: string) => {
		setCardAmount(value);
		const cardVal = Number.parseFloat(value) || 0;
		setCashAmount((total - cardVal).toFixed(2));
	};

	const handleConfirm = () => {
		if (isValid) {
			onConfirm(cash, card);
			setCashAmount("");
			setCardAmount("");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Mixed Payment</DialogTitle>
					<DialogDescription>
						Split the ${total.toFixed(2)} total between cash and card.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="cash-amount">Cash Amount</Label>
						<Input
							id="cash-amount"
							type="number"
							step="0.01"
							min="0"
							placeholder="0.00"
							value={cashAmount}
							onChange={(e) => handleCashChange(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="card-amount">Card Amount</Label>
						<Input
							id="card-amount"
							type="number"
							step="0.01"
							min="0"
							placeholder="0.00"
							value={cardAmount}
							onChange={(e) => handleCardChange(e.target.value)}
						/>
					</div>
					{!isValid && (cash > 0 || card > 0) && (
						<p className="text-sm text-destructive">
							Amounts must sum to ${total.toFixed(2)}
						</p>
					)}
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleConfirm} disabled={!isValid}>
						Confirm Payment
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
