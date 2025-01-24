import { timestamp } from "drizzle-orm/pg-core";
import { snowflake } from "./custom-types.js";

/**
 * Common Columns
 * Common columns for the database
 */

/**
 * Updated and Created At
 * Columns for the updated and created at timestamps
 */
export const updatedAndCreatedAt = {
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at", {
		mode: "date",
		precision: 3,
	}).$onUpdate(() => new Date()),
};

/**
 * Audit Columns
 * Columns for the audit columns
 * @see https://github.com/drizzle-team/drizzle-orm/blob/master/examples/postgres/audit-columns/index.ts
 */

export const auditColumns = {
	createdBy: snowflake("created_by"),
	updatedBy: snowflake("updated_by"),
};
