import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { clearSessionCookieFn } from "#/features/auth/api-client";

export function useAuth() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const ctx = useRouteContext({ strict: false }) as {
		user?: { id: number; name: string; email: string; role: string };
	};

	const user = ctx?.user ?? null;

	const logout = useMutation({
		mutationFn: async () => {
			await clearSessionCookieFn();
		},
		onSuccess: () => {
			queryClient.clear();
			navigate({ to: "/login" });
		},
	});

	return {
		user,
		isLoading: false,
		isAuthenticated: !!user,
		logout: () => logout.mutate(),
	};
}
