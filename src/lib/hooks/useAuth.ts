import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { meFromCookieFn, clearSessionCookieFn } from "#/features/auth/api-client";

export function useAuth() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const {
		data: user,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["auth", "me"],
		queryFn: () => meFromCookieFn(),
		retry: false,
		staleTime: 5 * 60 * 1000,
	});

	const logout = useMutation({
		mutationFn: async () => {
			await clearSessionCookieFn();
		},
		onSuccess: () => {
			queryClient.clear();
			navigate({ to: "/login" as any });
		},
	});

	const isAuthenticated = !isLoading && !error && !!user;

	return {
		user: user ?? null,
		isLoading,
		isAuthenticated,
		logout: () => logout.mutate(),
	};
}
