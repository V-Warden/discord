import { relations } from "drizzle-orm";
import { pgTable, varchar } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { auditColumns, updatedAndCreatedAt } from "./common-columns";
import { snowflake } from "./custom-types";
import { punishments } from "./punishments";

/**
 * Database Schema Definition
 * Defines the structure of the 'guilds' table in PostgreSQL
 */

export const guilds = pgTable("guilds", {
	id: snowflake(),
	name: varchar(),
	logChannelId: snowflake(),

	// Audit Columns
	...updatedAndCreatedAt,
	...auditColumns,
});

/**
 * Relations
 * Relations for the guilds table
 */

export const guildsRelations = relations(guilds, ({ one }) => ({
	punishments: one(punishments, {
		fields: [guilds.id],
		references: [punishments.guildId],
	}),
}));

/**
 * Zod Schema Definitions
 * Type validation schemas for note operations
 */

export const zGuildSchema = createInsertSchema(guilds)
	.extend({
		id: z.string(),
	})
	.required();

export const zGuildRequired = zGuildSchema.pick({
	id: true,
	name: true,
});

export const zGuildMutable = zGuildSchema
	.omit({
		id: true,
	})
	.deepPartial();

export const zGuildCreate = zGuildMutable.extend(zGuildRequired.shape);

export const zGuildUpdateSchema = createUpdateSchema(guilds).extend({});
export const zGuildSelectSchema = createSelectSchema(guilds).extend({});

export type GuildInsert = z.infer<typeof zGuildCreate>;
export type GuildUpdate = z.infer<typeof zGuildUpdateSchema>;
export type GuildSelect = z.infer<typeof zGuildSelectSchema>;
