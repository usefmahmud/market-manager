import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial().primaryKey(),
	name: text().notNull(),
	email: text().unique().notNull(),
	role: text().notNull().default("cashier"),
	passwordHash: text("password_hash").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});
