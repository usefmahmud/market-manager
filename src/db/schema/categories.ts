import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
	id: serial().primaryKey(),
	name: text().notNull(),
	description: text(),
	parentId: integer("parent_id").references(
		(): AnyPgColumn => categories.id as AnyPgColumn,
	),
	createdAt: timestamp("created_at").defaultNow(),
});
