import {
	decimal,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { suppliers } from "./suppliers";
import { users } from "./users";

export const stockBatches = pgTable("stock_batches", {
	id: serial().primaryKey(),
	productId: integer("product_id")
		.references(() => products.id)
		.notNull(),
	supplierId: integer("supplier_id").references(() => suppliers.id),
	batchNumber: text("batch_number"),
	quantity: integer().notNull(),
	expiryDate: timestamp("expiry_date"),
	purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
	receivedBy: integer("received_by").references(() => users.id),
	createdAt: timestamp("created_at").defaultNow(),
});

export const stockAdjustments = pgTable("stock_adjustments", {
	id: serial().primaryKey(),
	productId: integer("product_id")
		.references(() => products.id)
		.notNull(),
	quantityChange: integer("quantity_change").notNull(),
	reason: text().notNull(),
	adjustedBy: integer("adjusted_by").references(() => users.id),
	createdAt: timestamp("created_at").defaultNow(),
});
