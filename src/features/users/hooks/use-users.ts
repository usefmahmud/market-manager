import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
			toast.success("User created");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create user");
		},
	});
}

export function useUpdateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateUserInput) => updateUserFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("User updated");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update user");
		},
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { id: number }) => deleteUserFn({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("User deleted");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete user");
		},
	});
}
