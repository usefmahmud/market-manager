import { Button } from "#/lib/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/lib/components/ui/table";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "../hooks/use-checkout";

interface CartProps {
	items: CartItem[];
 onUpdateQuantity: (productId: number, quantity: number) => void;
	onClear: () => void;
}

export function Cart({ items, onUpdateQuantity, onClear }: CartProps) {
	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between p-4 border-b">
				<h2 className="text-lg font-semibold">Cart ({items.length})</h2>
				{items.length > 0 && (
					<Button variant="ghost" size="sm" onClick={onClear}>
						Clear
					</Button>
				)}
			</div>
			<div className="flex-1 overflow-auto">
				{items.length === 0 ? (
					<div className="flex items-center justify-center h-full text-muted-foreground">
						Scan a barcode or search for products
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Item</TableHead>
								<TableHead className="w-24">Qty</TableHead>
								<TableHead className="text-right">Price</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.map((item) => (
								<TableRow key={item.productId}>
									<TableCell>
										<div>
											<p className="font-medium">{item.name}</p>
											<p className="text-sm text-muted-foreground">
												${Number(item.price).toFixed(2)} each
											</p>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1">
											<Button
												variant="outline"
												size="icon"
												className="size-7"
												onClick={() =>
													onUpdateQuantity(item.productId, item.quantity - 1)
												}
											>
												<Minus className="size-3" />
											</Button>
											<span className="w-8 text-center">{item.quantity}</span>
											<Button
												variant="outline"
												size="icon"
												className="size-7"
												onClick={() =>
													onUpdateQuantity(item.productId, item.quantity + 1)
												}
											>
												<Plus className="size-3" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="size-7"
												onClick={() => onUpdateQuantity(item.productId, 0)}
											>
												<Trash2 className="size-3 text-destructive" />
											</Button>
										</div>
									</TableCell>
									<TableCell className="text-right">
										${(Number(item.price) * item.quantity).toFixed(2)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>
		</div>
	);
}
