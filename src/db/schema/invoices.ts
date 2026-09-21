import {
	decimal,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { users } from "./users";

export const invoices = pgTable("invoices", {
	id: serial().primaryKey(),
	invoiceNumber: text("invoice_number").unique().notNull(),
	userId: integer("user_id")
		.references(() => users.id)
		.notNull(),
	paymentMethod: text("payment_method").notNull(),
	subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
	tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
	total: decimal("total", { precision: 10, scale: 2 }).notNull(),
	voidedAt: timestamp("voided_at"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
	id: serial().primaryKey(),
	invoiceId: integer("invoice_id")
		.references(() => invoices.id)
		.notNull(),
	productId: integer("product_id")
		.references(() => products.id)
		.notNull(),
	quantity: integer().notNull(),
	unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
	total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});
