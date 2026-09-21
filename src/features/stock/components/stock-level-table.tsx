import { Wrench } from "lucide-react";
import { Badge } from "#/lib/components/ui/badge";
import { Button } from "#/lib/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/lib/components/ui/table";

interface StockLevel {
	productId: number;
	productName: string;
	barcode: string | null;
	totalQuantity: number;
}

interface StockLevelTableProps {
	levels: StockLevel[];
	onAdjust: (product: { id: number; name: string }) => void;
}

export function StockLevelTable({ levels, onAdjust }: StockLevelTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Product</TableHead>
					<TableHead>Barcode</TableHead>
					<TableHead>Quantity</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className="w-24">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{levels.length === 0 ? (
					<TableRow>
						<TableCell
							colSpan={5}
							className="text-center text-muted-foreground"
						>
							No stock data found
						</TableCell>
					</TableRow>
				) : (
					levels.map((level) => (
						<TableRow key={level.productId}>
							<TableCell className="font-medium">{level.productName}</TableCell>
							<TableCell className="font-mono text-sm">
								{level.barcode || "—"}
							</TableCell>
							<TableCell>{level.totalQuantity}</TableCell>
							<TableCell>
								<Badge
									variant={
										level.totalQuantity === 0
											? "destructive"
											: level.totalQuantity < 10
												? "secondary"
												: "default"
									}
								>
									{level.totalQuantity === 0
										? "Out of Stock"
										: level.totalQuantity < 10
											? "Low Stock"
											: "In Stock"}
								</Badge>
							</TableCell>
							<TableCell>
								<Button
									variant="ghost"
									size="icon"
									onClick={() =>
										onAdjust({
											id: level.productId,
											name: level.productName,
										})
									}
								>
									<Wrench className="size-4" />
								</Button>
							</TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	);
}
