import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { auditColumns, updatedAndCreatedAt } from "./common-columns";
import { snowflake, userStatus, userType } from "./custom-types";
import { notes } from "./notes";

/**
 * Database Schema Definition
 * Defines the structure of the 'users' table in PostgreSQL
 */

export const users = pgTable("users", {
	id: snowflake().primaryKey(),
	last_username: varchar().notNull(),

	appeals: integer().notNull().default(0),
	first_appeal: timestamp(),
	last_appeal: timestamp(),

	status: userStatus().notNull().default("BLACKLISTED"),
	type: userType().notNull(),

	// Audit Columns
	...updatedAndCreatedAt,
	...auditColumns,
});

/**
 * Relations
 * Relations for the users table
 */

export const usersRelations = relations(users, ({ many }) => ({
	notes: many(notes),
}));

/**
 * Zod Schema Definitions
 * Type validation schemas for user operations
 */

export const zUserSchema = createInsertSchema(users)
	.extend({
		id: z.string(),
	})
	.required();

export const zUserRequired = zUserSchema.pick({
	id: true,
	last_username: true,
	type: true,
});

export const zUserMutable = zUserSchema
	.omit({
		id: true,
	})
	.deepPartial();

export const zUserCreate = zUserMutable.extend(zUserRequired.shape);

export const zUserUpdateSchema = createUpdateSchema(users).extend({});
export const zUserSelectSchema = createSelectSchema(users).extend({});

export type UserInsert = z.infer<typeof zUserCreate>;
export type UserUpdate = z.infer<typeof zUserUpdateSchema>;
export type UserSelect = z.infer<typeof zUserSelectSchema>;
