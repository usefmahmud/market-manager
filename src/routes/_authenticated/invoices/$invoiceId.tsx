import { createFileRoute } from "@tanstack/react-router";
import { useInvoice } from "#/features/invoices/hooks/use-invoices";
import { InvoiceDetail } from "#/features/invoices/components/invoice-detail";
import { Skeleton } from "#/lib/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/invoices/$invoiceId")({
	component: InvoiceDetailPage,
});

function InvoiceDetailPage() {
	const { invoiceId } = Route.useParams();
	const { data: invoice, isLoading } = useInvoice(Number(invoiceId));

	if (isLoading) {
		return (
			<div className="space-y-6 p-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!invoice) {
		return (
			<div className="p-6">
				<p className="text-muted-foreground">Invoice not found</p>
			</div>
		);
	}

	return (
		<div className="p-6">
			<InvoiceDetail invoice={invoice} />
		</div>
	);
}
