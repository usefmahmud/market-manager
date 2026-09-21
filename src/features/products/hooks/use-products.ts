import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createProductFn,
	deleteProductFn,
	getProductsFn,
	updateProductFn,
} from "#/features/products/api";
import type {
	CreateProductInput,
	UpdateProductInput,
} from "#/features/products/types";

interface ProductFilters {
	search?: string;
	categoryId?: number;
	barcode?: string;
}

export const productsQueryOptions = (filters: ProductFilters = {}) => ({
	queryKey: ["products", filters],
	queryFn: () => getProductsFn({ data: filters }),
});

export function useProducts(filters: ProductFilters = {}) {
	return useQuery(productsQueryOptions(filters));
}

export function useCreateProduct() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateProductInput) => createProductFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			toast.success("Product created");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create product");
		},
	});
}

export function useUpdateProduct() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateProductInput) => updateProductFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			toast.success("Product updated");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update product");
		},
	});
}

export function useDeleteProduct() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { id: number }) => deleteProductFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			toast.success("Product deleted");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete product");
		},
	});
}
