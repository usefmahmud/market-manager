import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const suppliers = pgTable("suppliers", {
	id: serial().primaryKey(),
	name: text().notNull(),
	contactPerson: text("contact_person"),
	phone: text(),
	email: text(),
	address: text(),
	createdAt: timestamp("created_at").defaultNow(),
});
