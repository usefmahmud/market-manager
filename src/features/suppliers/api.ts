import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { db } from "#/db";
import { suppliers } from "#/db/schema";
import { deleteRecord } from "#/lib/db-helpers";
import { createSupplierSchema, updateSupplierSchema } from "./types";

export const getSuppliersFn = createServerFn({ method: "GET" }).handler(
	async () => {
		return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
	},
);

export const getSupplierFn = createServerFn({ method: "GET" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		const supplier = await db
			.select()
			.from(suppliers)
			.where(eq(suppliers.id, data.id))
			.limit(1);

		if (supplier.length === 0) {
			throw new Error("Supplier not found");
		}

		return supplier[0];
	});

export const createSupplierFn = createServerFn({ method: "POST" })
	.validator(createSupplierSchema)
	.handler(async ({ data }) => {
		const newSupplier = await db.insert(suppliers).values(data).returning();
		return newSupplier[0];
	});

export const updateSupplierFn = createServerFn({ method: "POST" })
	.validator(updateSupplierSchema)
	.handler(async ({ data }) => {
		const { id, ...updates } = data;

		const updated = await db
			.update(suppliers)
			.set(updates)
			.where(eq(suppliers.id, id))
			.returning();

		if (updated.length === 0) {
			throw new Error("Supplier not found");
		}

		return updated[0];
	});

export const deleteSupplierFn = createServerFn({ method: "POST" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		return deleteRecord({
			tableName: "Supplier",
			id: data.id,
			table: suppliers,
			errorMessage: "Supplier not found",
		});
	});
