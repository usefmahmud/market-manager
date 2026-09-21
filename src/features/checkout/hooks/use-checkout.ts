import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { createInvoiceFn } from "#/features/checkout/api";
import type { CheckoutItemInput } from "#/features/checkout/types";
import { useAuth } from "#/lib/hooks/useAuth";

export interface CartItem {
	productId: number;
	name: string;
	price: string;
	quantity: number;
}

export function useCheckout() {
	const { user } = useAuth();
	const [cart, setCart] = useState<CartItem[]>([]);

	const createInvoice = useMutation({
		mutationFn: createInvoiceFn,
	});

	const addToCart = useCallback(
		(product: { id: number; name: string; price: string }) => {
			setCart((prev) => {
				const existing = prev.find((item) => item.productId === product.id);
				if (existing) {
					return prev.map((item) =>
						item.productId === product.id
							? { ...item, quantity: item.quantity + 1 }
							: item,
					);
				}
				return [
					...prev,
					{
						productId: product.id,
						name: product.name,
						price: product.price,
						quantity: 1,
					},
				];
			});
		},
		[],
	);

	const updateQuantity = useCallback((productId: number, quantity: number) => {
		if (quantity <= 0) {
			setCart((prev) => prev.filter((item) => item.productId !== productId));
		} else {
			setCart((prev) =>
				prev.map((item) =>
					item.productId === productId ? { ...item, quantity } : item,
				),
			);
		}
	}, []);

	const clearCart = useCallback(() => {
		setCart([]);
	}, []);

	const subtotal = cart.reduce(
		(sum, item) => sum + Number(item.price) * item.quantity,
		0,
	);
	const tax = subtotal * 0.1; // 10% tax
	const total = subtotal + tax;

	const checkout = useCallback(
		(paymentMethod: "cash" | "card" | "mixed") => {
			if (!user || cart.length === 0) return;

			const items: CheckoutItemInput[] = cart.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
				unitPrice: item.price,
			}));

			createInvoice.mutate(
				{
					data: {
						userId: user.id,
						paymentMethod,
						items,
						subtotal: subtotal.toFixed(2),
						tax: tax.toFixed(2),
						total: total.toFixed(2),
					},
				},
				{
					onSuccess: () => {
						setCart([]);
					},
				},
			);
		},
		[user, cart, subtotal, tax, total, createInvoice],
	);

	return {
		cart,
		addToCart,
		updateQuantity,
		clearCart,
		subtotal,
		tax,
		total,
		checkout,
		isCheckingOut: createInvoice.isPending,
	};
}
