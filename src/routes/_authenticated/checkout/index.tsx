import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Banknote, CreditCard, Wallet } from "lucide-react";
import { useState } from "react";
import { Cart } from "#/features/checkout/components/cart";
import { MixedPaymentDialog } from "#/features/checkout/components/mixed-payment-dialog";
import { ProductSearch } from "#/features/checkout/components/product-search";
import { useCheckout } from "#/features/checkout/hooks/use-checkout";
import { Button } from "#/lib/components/ui/button";

export const Route = createFileRoute("/_authenticated/checkout/")({
	component: CheckoutPage,
});

function CheckoutPage() {
	const navigate = useNavigate();
	const [mixedPaymentOpen, setMixedPaymentOpen] = useState(false);
	const {
		cart,
		addToCart,
		updateQuantity,
		clearCart,
		total,
		checkout,
		isCheckingOut,
	} = useCheckout();

	return (
		<div className="flex h-screen bg-background">
			{/* Left side - Product search and cart */}
			<div className="flex-1 flex flex-col border-r">
				<div className="p-4 border-b flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate({ to: "/" })}
					>
						<ArrowLeft className="size-4" />
					</Button>
					<h1 className="text-xl font-bold">Checkout</h1>
					<span className="text-sm text-muted-foreground">
						(F2 to focus scanner)
					</span>
				</div>
				<div className="flex-1 overflow-hidden p-4">
					<ProductSearch onAddProduct={addToCart} />
				</div>
			</div>

			{/* Right side - Cart and payment */}
			<div className="w-[400px] flex flex-col">
				<div className="flex-1 overflow-hidden">
					<Cart
						items={cart}
						onUpdateQuantity={updateQuantity}
						onClear={clearCart}
					/>
				</div>

				{/* Summary and payment */}
				<div className="border-t p-4 space-y-4">
					<div className="space-y-2">
						<div className="flex justify-between font-bold text-lg">
							<span>Total</span>
							<span>${total.toFixed(2)}</span>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-2">
						<Button
							variant="outline"
							className="flex flex-col gap-1 h-auto py-3"
							onClick={() => checkout("cash")}
							disabled={cart.length === 0 || isCheckingOut}
						>
							<Banknote className="size-5" />
							<span className="text-xs">Cash</span>
						</Button>
						<Button
							variant="outline"
							className="flex flex-col gap-1 h-auto py-3"
							onClick={() => checkout("card")}
							disabled={cart.length === 0 || isCheckingOut}
						>
							<CreditCard className="size-5" />
							<span className="text-xs">Card</span>
						</Button>
						<Button
							variant="outline"
							className="flex flex-col gap-1 h-auto py-3"
							onClick={() => setMixedPaymentOpen(true)}
							disabled={cart.length === 0 || isCheckingOut}
						>
							<Wallet className="size-5" />
							<span className="text-xs">Mixed</span>
						</Button>
					</div>
				</div>
			</div>

			<MixedPaymentDialog
				open={mixedPaymentOpen}
				onOpenChange={setMixedPaymentOpen}
				total={total}
				onConfirm={() => {
					setMixedPaymentOpen(false);
					checkout("mixed");
				}}
			/>
		</div>
	);
}
