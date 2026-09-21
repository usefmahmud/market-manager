import { Link } from "@tanstack/react-router";
import type { InvoiceListItem } from "#/features/invoices/types";
import { Badge } from "#/lib/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/lib/components/ui/table";

interface InvoiceTableProps {
	invoices: InvoiceListItem[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Invoice #</TableHead>
					<TableHead>Date</TableHead>
					<TableHead>Cashier</TableHead>
					<TableHead>Items</TableHead>
					<TableHead>Payment</TableHead>
					<TableHead className="text-right">Total</TableHead>
					<TableHead>Status</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{invoices.length === 0 ? (
					<TableRow>
						<TableCell
							colSpan={7}
							className="text-center text-muted-foreground"
						>
							No invoices found
						</TableCell>
					</TableRow>
				) : (
					invoices.map((invoice) => (
						<TableRow key={invoice.id}>
							<TableCell>
								<Link
									to="/invoices/$invoiceId"
									params={{ invoiceId: invoice.id.toString() }}
									className="font-medium text-primary hover:underline"
								>
									{invoice.invoiceNumber}
								</Link>
							</TableCell>
							<TableCell>
								{invoice.createdAt
									? new Date(invoice.createdAt).toLocaleDateString()
									: "—"}
							</TableCell>
							<TableCell>{invoice.userName || "—"}</TableCell>
							<TableCell>{invoice.itemCount}</TableCell>
							<TableCell>
								<Badge variant="outline" className="capitalize">
									{invoice.paymentMethod}
								</Badge>
							</TableCell>
							<TableCell className="text-right font-medium">
								${Number(invoice.total).toFixed(2)}
							</TableCell>
							<TableCell>
								{invoice.voidedAt ? (
									<Badge variant="destructive">Voided</Badge>
								) : (
									<Badge variant="default">Valid</Badge>
								)}
							</TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	);
}
