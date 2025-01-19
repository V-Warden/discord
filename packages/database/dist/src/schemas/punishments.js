"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zPunishmentSelectSchema = exports.zPunishmentUpdateSchema = exports.zPunishmentCreate = exports.zPunishmentMutable = exports.zPunishmentRequired = exports.zPunishmentSchema = exports.zUnbanSchema = exports.punishmentsRelations = exports.punishments = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const common_columns_1 = require("./common-columns");
const custom_types_1 = require("./custom-types");
const guilds_1 = require("./guilds");
/**
 * Database Schema Definition
 * Defines the structure of the 'punishments' table in PostgreSQL
 */
exports.punishments = (0, pg_core_1.pgTable)("punishments", {
    id: (0, custom_types_1.snowflake)(),
    // Punishment Settings
    enabled: (0, pg_core_1.boolean)().default(false),
    roleId: (0, custom_types_1.snowflake)(),
    unban: (0, pg_core_1.jsonb)().default({
        enabled: false,
        owner: false,
        supporter: false,
        cheater: false,
        leaker: false,
        other: false,
    }),
    // Punishment Types
    owner: (0, custom_types_1.punishmentType)().default("BAN"),
    supporter: (0, custom_types_1.punishmentType)().default("KICK"),
    leaker: (0, custom_types_1.punishmentType)().default("WARN"),
    cheater: (0, custom_types_1.punishmentType)().default("WARN"),
    other: (0, custom_types_1.punishmentType)().default("WARN"),
    // Audit Columns
    ...common_columns_1.updatedAndCreatedAt,
    ...common_columns_1.auditColumns,
});
/**
 * Relations
 * Relations for the punishments table
 */
exports.punishmentsRelations = (0, drizzle_orm_1.relations)(exports.punishments, ({ one }) => ({
    guild: one(guilds_1.guilds, {
        fields: [exports.punishments.id],
        references: [guilds_1.guilds.id],
    }),
}));
/**
 * Zod Schema Definitions
 * Type validation schemas for punishment operations
 */
// Define the unban schema once
exports.zUnbanSchema = zod_1.z.object({
    enabled: zod_1.z.boolean(),
    owner: zod_1.z.boolean(),
    supporter: zod_1.z.boolean(),
    cheater: zod_1.z.boolean(),
    leaker: zod_1.z.boolean(),
    other: zod_1.z.boolean(),
});
exports.zPunishmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.punishments, {
    unban: exports.zUnbanSchema,
})
    .extend({
    id: zod_1.z.string(),
})
    .required();
exports.zPunishmentRequired = exports.zPunishmentSchema.pick({
    id: true,
});
exports.zPunishmentMutable = exports.zPunishmentSchema
    .omit({
    id: true,
})
    .deepPartial();
exports.zPunishmentCreate = exports.zPunishmentMutable.extend(exports.zPunishmentRequired.shape);
exports.zPunishmentUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.punishments, {
    unban: exports.zUnbanSchema,
}).extend({});
exports.zPunishmentSelectSchema = (0, drizzle_zod_1.createSelectSchema)(exports.punishments, {
    unban: exports.zUnbanSchema,
}).extend({});
//# sourceMappingURL=punishments.js.map