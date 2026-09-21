import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getSuppliersFn,
	createSupplierFn,
	updateSupplierFn,
	deleteSupplierFn,
} from "#/features/suppliers/api";
import type { CreateSupplierInput, UpdateSupplierInput } from "#/features/suppliers/types";

export const suppliersQueryOptions = {
	queryKey: ["suppliers"],
	queryFn: () => getSuppliersFn({ data: undefined }),
};

export function useSuppliers() {
	return useQuery(suppliersQueryOptions);
}

export function useCreateSupplier() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateSupplierInput) => createSupplierFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["suppliers"] });
		},
	});
}

export function useUpdateSupplier() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateSupplierInput) => updateSupplierFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["suppliers"] });
		},
	});
}

export function useDeleteSupplier() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { id: number }) => deleteSupplierFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["suppliers"] });
		},
	});
}
