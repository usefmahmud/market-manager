import { createFileRoute } from "@tanstack/react-router";
import { useInvoices } from "#/features/invoices/hooks/use-invoices";
import { InvoiceTable } from "#/features/invoices/components/invoice-table";
import { Skeleton } from "#/lib/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/invoices/")({
	component: InvoicesPage,
});

function InvoicesPage() {
	const { data: invoices, isLoading } = useInvoices();

	return (
		<div className="space-y-6 p-6">
			<h1 className="text-3xl font-bold">Invoices</h1>

			{isLoading ? (
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-12 w-full" />
					))}
				</div>
			) : (
				<InvoiceTable invoices={invoices ?? []} />
			)}
		</div>
	);
}
