import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createCategoryFn,
	deleteCategoryFn,
	getCategoriesFn,
	updateCategoryFn,
} from "#/features/categories/api";
import type {
	CreateCategoryInput,
	UpdateCategoryInput,
} from "#/features/categories/types";

export const categoriesQueryOptions = {
	queryKey: ["categories"],
	queryFn: () => getCategoriesFn({ data: undefined }),
};

export function useCategories() {
	return useQuery(categoriesQueryOptions);
}

export function useCreateCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateCategoryInput) => createCategoryFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
	});
}

export function useUpdateCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateCategoryInput) => updateCategoryFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
	});
}

export function useDeleteCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { id: number }) => deleteCategoryFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
	});
}
