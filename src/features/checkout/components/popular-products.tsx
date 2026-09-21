import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { getPopularProductsFn } from "#/features/products/api";
import { Button } from "#/lib/components/ui/button";

const clickSound =
	typeof Audio !== "undefined"
		? new Audio("/audio/mixkit-select-click-1109.wav")
		: null;

const playClickSound = () => {
	if (!clickSound) return;
	clickSound.currentTime = 0;
	clickSound.play();
};

interface PopularProductsProps {
	onAddProduct: (product: { id: number; name: string; price: string }) => void;
}

export function PopularProducts({ onAddProduct }: PopularProductsProps) {
	const { data: products } = useQuery({
		queryKey: ["products", "popular"],
		queryFn: () => getPopularProductsFn({ data: { limit: 8 } }),
	});

	if (!products || products.length === 0) return null;

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Star className="size-4" />
				<span>Popular Products</span>
			</div>
			<div className="grid grid-cols-4 gap-2">
				{products.map((product) => (
					<Button
						key={product.id}
						variant="outline"
						className="flex flex-col items-start gap-1 h-auto py-2 px-3 text-left"
						onClick={() => {
							playClickSound();
							onAddProduct({
								id: product.id,
								name: product.name,
								price: product.price,
							});
						}}
					>
						<span className="text-xs font-medium line-clamp-2 w-full">
							{product.name}
						</span>
						<span className="text-xs text-muted-foreground">
							${Number(product.price).toFixed(2)}
						</span>
					</Button>
				))}
			</div>
		</div>
	);
}
