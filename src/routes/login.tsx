import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "#/features/auth/components/login-form";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<LoginForm />
		</div>
	);
}
