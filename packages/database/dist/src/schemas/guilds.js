"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zGuildSelectSchema = exports.zGuildUpdateSchema = exports.zGuildCreate = exports.zGuildMutable = exports.zGuildRequired = exports.zGuildSchema = exports.guildsRelations = exports.guilds = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const common_columns_1 = require("./common-columns");
const custom_types_1 = require("./custom-types");
const punishments_1 = require("./punishments");
/**
 * Database Schema Definition
 * Defines the structure of the 'guilds' table in PostgreSQL
 */
exports.guilds = (0, pg_core_1.pgTable)("guilds", {
    id: (0, custom_types_1.snowflake)(),
    name: (0, pg_core_1.varchar)(),
    logChannelId: (0, custom_types_1.snowflake)(),
    // Audit Columns
    ...common_columns_1.updatedAndCreatedAt,
    ...common_columns_1.auditColumns,
});
/**
 * Relations
 * Relations for the guilds table
 */
exports.guildsRelations = (0, drizzle_orm_1.relations)(exports.guilds, ({ one }) => ({
    punishments: one(punishments_1.punishments, {
        fields: [exports.guilds.id],
        references: [punishments_1.punishments.id],
    }),
}));
/**
 * Zod Schema Definitions
 * Type validation schemas for note operations
 */
exports.zGuildSchema = (0, drizzle_zod_1.createInsertSchema)(exports.guilds)
    .extend({
    id: zod_1.z.string(),
})
    .required();
exports.zGuildRequired = exports.zGuildSchema.pick({
    id: true,
    name: true,
});
exports.zGuildMutable = exports.zGuildSchema
    .omit({
    id: true,
})
    .deepPartial();
exports.zGuildCreate = exports.zGuildMutable.extend(exports.zGuildRequired.shape);
exports.zGuildUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.guilds).extend({});
exports.zGuildSelectSchema = (0, drizzle_zod_1.createSelectSchema)(exports.guilds).extend({});
//# sourceMappingURL=guilds.js.map