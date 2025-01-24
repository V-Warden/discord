import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { auditColumns, updatedAndCreatedAt } from "./common-columns.js";
import { punishmentType, snowflake } from "./custom-types.js";
import { guilds } from "./guilds.js";

/**
 * Database Schema Definition
 * Defines the structure of the 'punishments' table in PostgreSQL
 */

export const punishments = pgTable("punishments", {
	guildId: snowflake("guild_id"),

	// Punishment Settings
	enabled: boolean().default(false),
	roleId: snowflake(),

	unban: jsonb().default({
		enabled: false,
		owner: false,
		supporter: false,
		cheater: false,
		leaker: false,
		other: false,
	}),

	// Punishment Types
	owner: punishmentType().default("BAN"),
	supporter: punishmentType().default("KICK"),
	leaker: punishmentType().default("WARN"),
	cheater: punishmentType().default("WARN"),
	other: punishmentType().default("WARN"),

	// Audit Columns
	...updatedAndCreatedAt,
	...auditColumns,
});

/**
 * Relations
 * Relations for the punishments table
 */

export const punishmentsRelations = relations(punishments, ({ one }) => ({
	guild: one(guilds, {
		fields: [punishments.guildId],
		references: [guilds.id],
	}),
}));

/**
 * Zod Schema Definitions
 * Type validation schemas for punishment operations
 */

// Define the unban schema once
export const zUnbanSchema = z.object({
	enabled: z.boolean(),
	owner: z.boolean(),
	supporter: z.boolean(),
	cheater: z.boolean(),
	leaker: z.boolean(),
	other: z.boolean(),
});

export const zPunishmentSchema = createInsertSchema(punishments, {
	unban: zUnbanSchema,
})
	.extend({
		guildId: z.string(),
	})
	.required();

export const zPunishmentRequired = zPunishmentSchema.pick({
	guildId: true,
});

export const zPunishmentMutable = zPunishmentSchema
	.omit({
		guildId: true,
	})
	.deepPartial();

export const zPunishmentCreate = zPunishmentMutable.extend(
	zPunishmentRequired.shape,
);

export const zPunishmentUpdateSchema = createUpdateSchema(punishments, {
	unban: zUnbanSchema,
}).extend({});

export const zPunishmentSelectSchema = createSelectSchema(punishments, {
	unban: zUnbanSchema,
}).extend({});

export type PunishmentInsert = z.infer<typeof zPunishmentCreate>;
export type PunishmentUpdate = z.infer<typeof zPunishmentUpdateSchema>;
export type PunishmentSelect = z.infer<typeof zPunishmentSelectSchema>;
