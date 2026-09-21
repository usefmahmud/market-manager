import { useQuery } from "@tanstack/react-query";
import { ScanBarcode, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getProductsFn } from "#/features/products/api";
import { Button } from "#/lib/components/ui/button";
import { Input } from "#/lib/components/ui/input";

interface ProductSearchProps {
	onAddProduct: (product: { id: number; name: string; price: string }) => void;
}

export function ProductSearch({ onAddProduct }: ProductSearchProps) {
	const [search, setSearch] = useState("");
	const [barcode, setBarcode] = useState("");
	const barcodeRef = useRef<HTMLInputElement>(null);

	const { data: products } = useQuery({
		queryKey: ["products", "pos", search],
		queryFn: () => getProductsFn({ data: { search } }),
		enabled: search.length > 0,
	});

	const handleBarcodeSubmit = async () => {
		if (!barcode.trim()) return;

		try {
			const product = await getProductsFn({
				data: { barcode: barcode.trim() },
			});
			if (product && product.length > 0) {
				onAddProduct({
					id: product[0].id,
					name: product[0].name,
					price: product[0].price,
				});
				setBarcode("");
			}
		} catch {
			// Product not found
		}
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "F2") {
				e.preventDefault();
				barcodeRef.current?.focus();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<div className="space-y-4">
			<div className="relative">
				<ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
				<Input
					ref={barcodeRef}
					placeholder="Scan barcode or press Enter to search..."
					value={barcode}
					onChange={(e) => setBarcode(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleBarcodeSubmit();
						}
					}}
					className="pl-9"
					autoFocus
				/>
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
				<Input
					placeholder="Search products..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-9"
				/>
			</div>

			{products && products.length > 0 && (
				<div className="border rounded-lg max-h-64 overflow-auto">
					{products.map((product) => (
						<Button
							key={product.id}
							variant="ghost"
							className="w-full justify-start"
							onClick={() => {
								onAddProduct({
									id: product.id,
									name: product.name,
									price: product.price,
								});
								setSearch("");
							}}
						>
							<div className="flex justify-between w-full">
								<span>{product.name}</span>
								<span className="text-muted-foreground">
									${Number(product.price).toFixed(2)}
								</span>
							</div>
						</Button>
					))}
				</div>
			)}
		</div>
	);
}
