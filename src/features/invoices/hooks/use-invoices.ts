import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getInvoiceFn,
	getInvoicesFn,
	voidInvoiceFn,
} from "#/features/invoices/api";
import type { InvoiceFilterInput } from "#/features/invoices/types";

export const invoicesQueryOptions = (filters: InvoiceFilterInput = {}) => ({
	queryKey: ["invoices", filters],
	queryFn: () => getInvoicesFn({ data: filters }),
});

export function useInvoices(filters: InvoiceFilterInput = {}) {
	return useQuery(invoicesQueryOptions(filters));
}

export function useInvoice(id: number) {
	return useQuery({
		queryKey: ["invoices", id],
		queryFn: () => getInvoiceFn({ data: { id } }),
		enabled: id > 0,
	});
}

export function useVoidInvoice() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { id: number }) => voidInvoiceFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
	});
}
