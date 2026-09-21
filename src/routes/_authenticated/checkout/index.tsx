import { createFileRoute } from "@tanstack/react-router";
import { useCheckout } from "#/features/checkout/hooks/use-checkout";
import { Cart } from "#/features/checkout/components/cart";
import { ProductSearch } from "#/features/checkout/components/product-search";
import { Button } from "#/lib/components/ui/button";
import { Separator } from "#/lib/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import {
	CreditCard,
	Banknote,
	Wallet,
	ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/checkout/")({
	component: CheckoutPage,
});

function CheckoutPage() {
	const navigate = useNavigate();
	const {
		cart,
		addToCart,
		updateQuantity,
		clearCart,
		subtotal,
		tax,
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
					<span className="text-sm text-muted-foreground">(F2 to focus search)</span>
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
						<div className="flex justify-between text-sm">
							<span>Subtotal</span>
							<span>${subtotal.toFixed(2)}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span>Tax (10%)</span>
							<span>${tax.toFixed(2)}</span>
						</div>
						<Separator />
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
							onClick={() => checkout("mixed")}
							disabled={cart.length === 0 || isCheckingOut}
						>
							<Wallet className="size-5" />
							<span className="text-xs">Mixed</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
