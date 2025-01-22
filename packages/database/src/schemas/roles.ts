import { pgTable, text } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { auditColumns, updatedAndCreatedAt } from "./common-columns";
import { snowflake } from "./custom-types";

/**
 * Database Schema Definition
 * Defines the structure of the 'roles' table in PostgreSQL
 */

export const rolesArchive = pgTable("roles_archive", {
	userId: snowflake("user_id"),
	guildId: snowflake("guild_id"),
	roles: text().array(),

	// Audit Columns
	...updatedAndCreatedAt,
	...auditColumns,
});

/**
 * Relations
 * Relations for the punishments table
 */

/**
 * Zod Schema Definitions
 * Type validation schemas for punishment operations
 */

// Define the unban schema once

export const zRoleArchiveSchema = createInsertSchema(rolesArchive, {})
	.extend({
		userId: z.string(),
		guildId: z.string(),
		roles: z.array(z.string()),
	})
	.required();

export const zRoleArchiveRequired = zRoleArchiveSchema.pick({
	userId: true,
	guildId: true,
	roles: true,
});

export const zRoleArchiveMutable = zRoleArchiveSchema
	.omit({
		userId: true,
		guildId: true,
	})
	.deepPartial();

export const zRoleArchiveCreate = zRoleArchiveMutable.extend(
	zRoleArchiveRequired.shape,
);

export const zRoleArchiveUpdateSchema = createUpdateSchema(
	rolesArchive,
	{},
).extend({});

export const zRoleArchiveSelectSchema = createSelectSchema(
	rolesArchive,
	{},
).extend({});

export type RoleArchiveInsert = z.infer<typeof zRoleArchiveCreate>;
export type RoleArchiveUpdate = z.infer<typeof zRoleArchiveUpdateSchema>;
export type RoleArchiveSelect = z.infer<typeof zRoleArchiveSelectSchema>;
