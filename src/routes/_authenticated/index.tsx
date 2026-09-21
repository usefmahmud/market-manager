import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
	component: Home,
});

function Home() {
	return (
		<div className="p-8">
			<h1 className="text-4xl font-bold">Welcome to Market Manager</h1>
			<p className="mt-4 text-lg">
				Navigate using the sidebar to manage your inventory.
			</p>
		</div>
	);
}
