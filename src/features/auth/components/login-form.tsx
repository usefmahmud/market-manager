import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginFn } from "#/features/auth/api";
import { type LoginInput, loginSchema } from "#/features/auth/types";
import { Button } from "#/lib/components/ui/button";
import { Input } from "#/lib/components/ui/input";
import { Label } from "#/lib/components/ui/label";

export function LoginForm() {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);

	const form = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	const login = useMutation({
		mutationFn: (data: LoginInput) => loginFn({ data }),
		onSuccess: () => {
			navigate({ to: "/" });
		},
		onError: (err: Error) => {
			setError(err.message);
		},
	});

	return (
		<div className="space-y-8">
			<div className="space-y-2 text-center">
				<h2 className="text-2xl font-bold tracking-tight text-foreground">
					Welcome back
				</h2>
				<p className="text-sm text-muted-foreground">
					Sign in to your account to continue
				</p>
			</div>
			<form
				onSubmit={form.handleSubmit((data) => login.mutate(data))}
				className="space-y-4"
			>
				{error && (
					<div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
						{error}
					</div>
				)}
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="you@example.com"
						{...form.register("email")}
					/>
					{form.formState.errors.email && (
						<p className="text-sm text-destructive">
							{form.formState.errors.email.message}
						</p>
					)}
				</div>
				<div className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						placeholder="••••••"
						{...form.register("password")}
					/>
					{form.formState.errors.password && (
						<p className="text-sm text-destructive">
							{form.formState.errors.password.message}
						</p>
					)}
				</div>
				<Button type="submit" className="w-full" disabled={login.isPending}>
					{login.isPending ? "Signing in..." : "Sign in"}
				</Button>
			</form>
		</div>
	);
}
