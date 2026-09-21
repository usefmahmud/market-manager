import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { UserDialog } from "#/features/users/components/user-dialog";
import { UserTable } from "#/features/users/components/user-table";
import { useUsers } from "#/features/users/hooks/use-users";
import { Button } from "#/lib/components/ui/button";
import { Skeleton } from "#/lib/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/settings/")({
	component: SettingsPage,
});

function SettingsPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const { data: users, isLoading } = useUsers();

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Settings</h1>
			</div>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">User Management</h2>
					<Button onClick={() => setCreateOpen(true)}>
						<Plus className="mr-2 size-4" />
						Add User
					</Button>
				</div>

				{isLoading ? (
					<div className="space-y-2">
						{Array.from({ length: 3 }).map((_, i) => (
							<Skeleton key={i} className="h-12 w-full" />
						))}
					</div>
				) : (
					<UserTable users={users ?? []} />
				)}
			</div>

			<UserDialog open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
}
