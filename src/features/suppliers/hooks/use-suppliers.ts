import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createSupplierFn,
	deleteSupplierFn,
	getSuppliersFn,
	updateSupplierFn,
} from "#/features/suppliers/api";
import type {
	CreateSupplierInput,
	UpdateSupplierInput,
} from "#/features/suppliers/types";

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
			toast.success("Supplier created");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create supplier");
		},
	});
}

export function useUpdateSupplier() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateSupplierInput) => updateSupplierFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["suppliers"] });
			toast.success("Supplier updated");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update supplier");
		},
	});
}

export function useDeleteSupplier() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { id: number }) => deleteSupplierFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["suppliers"] });
			toast.success("Supplier deleted");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete supplier");
		},
	});
}
