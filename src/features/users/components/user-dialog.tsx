import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	createUserSchema,
	type CreateUserInput,
} from "#/features/users/types";
import { useCreateUser, useUpdateUser } from "../hooks/use-users";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/lib/components/ui/dialog";
import { Button } from "#/lib/components/ui/button";
import { Input } from "#/lib/components/ui/input";
import { Label } from "#/lib/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/lib/components/ui/select";

interface UserDialogProps {
	user?: {
		id: number;
		name: string;
		email: string;
		role: string;
	};
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

type FormValues = {
	name: string;
	email: string;
	password: string;
	role?: "admin" | "cashier";
};

export function UserDialog({ user, open, onOpenChange }: UserDialogProps) {
	const isEditing = !!user;
	const createUser = useCreateUser();
	const updateUser = useUpdateUser();

	const form = useForm<FormValues>({
		resolver: zodResolver(createUserSchema) as any,
		defaultValues: {
			name: user?.name ?? "",
			email: user?.email ?? "",
			password: "",
			role: (user?.role as "admin" | "cashier") ?? "cashier",
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				name: user?.name ?? "",
				email: user?.email ?? "",
				password: "",
				role: (user?.role as "admin" | "cashier") ?? "cashier",
			});
		}
	}, [open, user, form]);

	const onSubmit = (data: FormValues) => {
		const submitData: CreateUserInput = {
			name: data.name,
			email: data.email,
			password: data.password,
			role: data.role ?? "cashier",
		};
		if (isEditing) {
			const updateData = {
				id: user.id,
				...submitData,
				...(data.password ? { password: data.password } : {}),
			};
			updateUser.mutate(updateData, {
				onSettled: () => onOpenChange(false),
			});
		} else {
			createUser.mutate(submitData, {
				onSettled: () => onOpenChange(false),
			});
		}
	};

	const isPending = createUser.isPending || updateUser.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit User" : "Create User"}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input id="name" {...form.register("name")} />
						{form.formState.errors.name && (
							<p className="text-sm text-destructive">
								{form.formState.errors.name.message}
							</p>
						)}
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" {...form.register("email")} />
						{form.formState.errors.email && (
							<p className="text-sm text-destructive">
								{form.formState.errors.email.message}
							</p>
						)}
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">
							{isEditing ? "Password (leave blank to keep)" : "Password"}
						</Label>
						<Input
							id="password"
							type="password"
							{...form.register("password")}
						/>
						{form.formState.errors.password && (
							<p className="text-sm text-destructive">
								{form.formState.errors.password.message}
							</p>
						)}
					</div>
					<div className="space-y-2">
						<Label>Role</Label>
						<Select
							value={form.watch("role")}
							onValueChange={(value) =>
								form.setValue("role", value as "admin" | "cashier")
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="cashier">Cashier</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Saving..." : isEditing ? "Update" : "Create"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
