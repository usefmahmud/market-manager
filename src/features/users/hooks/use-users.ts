import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createUserFn,
	deleteUserFn,
	getUsersFn,
	updateUserFn,
} from "#/features/users/api";
import type { CreateUserInput, UpdateUserInput } from "#/features/users/types";

export const usersQueryOptions = {
	queryKey: ["users"],
	queryFn: () => getUsersFn({ data: undefined }),
};

export function useUsers() {
	return useQuery(usersQueryOptions);
}

export function useCreateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateUserInput) => createUserFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

export function useUpdateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateUserInput) => updateUserFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { id: number }) => deleteUserFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}
