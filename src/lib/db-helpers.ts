import { type Column, eq, type Table } from "drizzle-orm";
import { db } from "#/db";

export interface DeleteOptions {
	tableName: string;
	id: number;
	table: Table & { id: Column };
	errorMessage?: string;
}

export async function deleteRecord(options: DeleteOptions) {
	const { table, id, errorMessage } = options;
	const deleted = await db.delete(table).where(eq(table.id, id)).returning();

	if (deleted.length === 0) {
		throw new Error(errorMessage ?? `${options.tableName} not found`);
	}

	return { success: true };
}
