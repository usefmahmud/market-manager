import {
	decimal,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";

export const products = pgTable("products", {
	id: serial().primaryKey(),
	name: text().notNull(),
	barcode: text().unique(),
	categoryId: integer("category_id").references(() => categories.id),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	unit: text().default("piece"),
	description: text(),
	image: text(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});
