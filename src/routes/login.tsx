import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "#/features/auth/components/login-form";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	return (
		<div className="fixed inset-0 flex">
			<div className="relative hidden w-2/5 items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 lg:flex">
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
					<div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/5" />
					<div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-white/5" />
				</div>
				<div className="relative z-10 text-center text-white">
					<h1 className="mb-3 text-5xl font-bold tracking-tight">
						Market Manager
					</h1>
					<p className="text-lg text-indigo-200">
						Stock management made simple
					</p>
				</div>
			</div>
			<div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
				<div className="w-full max-w-md">
					<div className="mb-8 text-center lg:hidden">
						<h1 className="text-3xl font-bold tracking-tight text-foreground">
							Market Manager
						</h1>
						<p className="mt-1 text-muted-foreground">
							Stock management made simple
						</p>
					</div>
					<LoginForm />
				</div>
			</div>
		</div>
	);
}
