import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getStockLevelsFn,
	adjustStockFn,
	getStockHistoryFn,
} from "#/features/stock/api";
import type { AdjustStockInput } from "#/features/stock/types";

export const stockLevelsQueryOptions = {
	queryKey: ["stock", "levels"],
	queryFn: () => getStockLevelsFn({ data: undefined }),
};

export function useStockLevels() {
	return useQuery(stockLevelsQueryOptions);
}

export function useStockHistory(productId?: number) {
	return useQuery({
		queryKey: ["stock", "history", productId],
		queryFn: () => getStockHistoryFn({ data: { productId } }),
	});
}

export function useAdjustStock() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: AdjustStockInput) => adjustStockFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["stock"] });
		},
	});
}
