import type { InvoiceDetail as InvoiceDetailType } from "#/features/invoices/types";
import { Button } from "#/lib/components/ui/button";
import { Separator } from "#/lib/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/lib/components/ui/table";
import { useVoidInvoice } from "../hooks/use-invoices";

interface InvoiceDetailProps {
	invoice: InvoiceDetailType;
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
	const voidInvoice = useVoidInvoice();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">{invoice.invoiceNumber}</h2>
					<p className="text-muted-foreground">
						{invoice.createdAt
							? new Date(invoice.createdAt).toLocaleString()
							: "—"}
					</p>
				</div>
				{!invoice.voidedAt && (
					<Button
						variant="destructive"
						onClick={() => voidInvoice.mutate({ id: invoice.id })}
						disabled={voidInvoice.isPending}
					>
						Void Invoice
					</Button>
				)}
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<p className="text-sm text-muted-foreground">Cashier</p>
					<p className="font-medium">{invoice.userName || "—"}</p>
				</div>
				<div>
					<p className="text-sm text-muted-foreground">Payment Method</p>
					<p className="font-medium capitalize">{invoice.paymentMethod}</p>
				</div>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Product</TableHead>
						<TableHead className="text-right">Qty</TableHead>
						<TableHead className="text-right">Price</TableHead>
						<TableHead className="text-right">Total</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{invoice.items.map((item) => (
						<TableRow key={item.id}>
							<TableCell>{item.productName}</TableCell>
							<TableCell className="text-right">{item.quantity}</TableCell>
							<TableCell className="text-right">
								${Number(item.unitPrice).toFixed(2)}
							</TableCell>
							<TableCell className="text-right">
								${Number(item.total).toFixed(2)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<Separator />

			<div className="space-y-2">
				<div className="flex justify-between text-sm">
					<span>Subtotal</span>
					<span>${Number(invoice.subtotal).toFixed(2)}</span>
				</div>
				<div className="flex justify-between text-sm">
					<span>Tax</span>
					<span>${Number(invoice.tax).toFixed(2)}</span>
				</div>
				<Separator />
				<div className="flex justify-between font-bold text-lg">
					<span>Total</span>
					<span>${Number(invoice.total).toFixed(2)}</span>
				</div>
			</div>
		</div>
	);
}
