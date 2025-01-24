import { relations } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { auditColumns, updatedAndCreatedAt } from "./common-columns.js";
import { serverType, snowflake } from "./custom-types.js";
import { imports } from "./imports.js";

/**
 * Database Schema Definition
 * Defines the structure of the 'bad_servers' table in PostgreSQL
 */

export const badServers = pgTable("bad_servers", {
	id: snowflake().primaryKey(),

	name: varchar().notNull(),
	oldNames: text("old_names").array(),

	type: serverType().notNull(),
	invite: varchar(),

	reason: varchar().default("None provided"),

	// Audit Columns
	...updatedAndCreatedAt,
	...auditColumns,
});

/**
 * Relations
 * Relations for the notes table
 */

export const badServersRelations = relations(badServers, ({ many }) => ({
	imports: many(imports),
}));

/**
 * Zod Schema Definitions
 * Type validation schemas for note operations
 */

export const zBadServerSchema = createInsertSchema(badServers)
	.extend({
		oldNames: z.array(z.string()),
	})
	.required();

export const zBadServerRequired = zBadServerSchema.pick({
	id: true,
	name: true,
	type: true,
});

export const zBadServerMutable = zBadServerSchema
	.omit({
		id: true,
	})
	.deepPartial();

export const zBadServerCreate = zBadServerMutable
	.extend(zBadServerRequired.shape)
	.extend({
		createdBy: z.string(),
	});

export const zBadServerUpdateSchema = createUpdateSchema(badServers).extend({});
export const zBadServerSelectSchema = createSelectSchema(badServers).extend({});

export type BadServerInsert = z.infer<typeof zBadServerCreate>;
export type BadServerUpdate = z.infer<typeof zBadServerUpdateSchema>;
export type BadServerSelect = z.infer<typeof zBadServerSelectSchema>;
