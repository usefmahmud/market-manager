import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createContext, useContext } from "react";
import { clearSessionCookieFn } from "#/features/auth/api-client";

export interface AuthUser {
	id: number;
	name: string;
	email: string;
	role: string;
}

export const AuthContext = createContext<AuthUser | null>(null);

export function useAuth() {
	const user = useContext(AuthContext);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

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
