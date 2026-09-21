import { createFileRoute } from "@tanstack/react-router";
import { StatsCards } from "#/features/dashboard/components/stats-cards";

export const Route = createFileRoute("/_authenticated/")({
	component: DashboardPage,
});

function DashboardPage() {
	return (
		<div className="space-y-6 p-6">
			<h1 className="text-3xl font-bold">Dashboard</h1>
			<StatsCards />
		</div>
	);
}
