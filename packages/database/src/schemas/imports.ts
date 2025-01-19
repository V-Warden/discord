import { relations } from "drizzle-orm";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { badServers } from "./bad-servers";
import { auditColumns, updatedAndCreatedAt } from "./common-columns";
import { snowflake, userType } from "./custom-types";
import { users } from "./users";

/**
 * Database Schema Definition
 * Defines the structure of the 'imports' table in PostgreSQL
 */

export const imports = pgTable("imports", {
	id: snowflake().references(() => users.id, {
		onDelete: "restrict",
		onUpdate: "restrict",
	}),

	server: snowflake("server_id").references(() => badServers.id, {
		onDelete: "restrict",
		onUpdate: "restrict",
	}),

	roles: text().array(),
	type: userType(),
	appealed: boolean().default(false),

	// Audit Columns
	...updatedAndCreatedAt,
	...auditColumns,
});

/**
 * Relations
 * Relations for the notes table
 */

export const importsRelations = relations(imports, ({ one }) => ({
	user: one(users, {
		fields: [imports.id],
		references: [users.id],
	}),
	badServer: one(badServers, {
		fields: [imports.server],
		references: [badServers.id],
	}),
}));

/**
 * Zod Schema Definitions
 * Type validation schemas for note operations
 */

export const zImportSchema = createInsertSchema(imports)
	.extend({
		id: z.string(),
		server: z.string(),
	})
	.required();

export const zImportRequired = zImportSchema.pick({
	id: true,
	server: true,
	roles: true,
	type: true,
});

export const zImportMutable = zImportSchema
	.omit({
		id: true,
		server: true,
	})
	.deepPartial();

export const zImportCreate = zImportMutable
	.extend(zImportRequired.shape)
	.extend({
		createdBy: z.string(),
	});

export const zImportUpdateSchema = createUpdateSchema(imports).extend({});
export const zImportSelectSchema = createSelectSchema(imports).extend({});

export type ImportInsert = z.infer<typeof zImportSchema>;
export type ImportUpdate = z.infer<typeof zImportUpdateSchema>;
export type ImportSelect = z.infer<typeof zImportSelectSchema>;
