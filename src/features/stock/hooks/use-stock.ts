import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	adjustStockFn,
	getStockHistoryFn,
	getStockLevelsFn,
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
