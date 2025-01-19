"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zBadServerSelectSchema = exports.zBadServerUpdateSchema = exports.zBadServerCreate = exports.zBadServerMutable = exports.zBadServerRequired = exports.zBadServerSchema = exports.badServersRelations = exports.badServers = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const common_columns_1 = require("./common-columns");
const custom_types_1 = require("./custom-types");
const imports_1 = require("./imports");
/**
 * Database Schema Definition
 * Defines the structure of the 'bad_servers' table in PostgreSQL
 */
exports.badServers = (0, pg_core_1.pgTable)("bad_servers", {
    id: (0, custom_types_1.snowflake)().primaryKey(),
    name: (0, pg_core_1.varchar)().notNull(),
    oldNames: (0, pg_core_1.text)("old_names").array(),
    type: (0, custom_types_1.serverType)().notNull(),
    invite: (0, pg_core_1.varchar)(),
    reason: (0, pg_core_1.varchar)().default("None provided"),
    // Audit Columns
    ...common_columns_1.updatedAndCreatedAt,
    ...common_columns_1.auditColumns,
});
/**
 * Relations
 * Relations for the notes table
 */
exports.badServersRelations = (0, drizzle_orm_1.relations)(exports.badServers, ({ many }) => ({
    imports: many(imports_1.imports),
}));
/**
 * Zod Schema Definitions
 * Type validation schemas for note operations
 */
exports.zBadServerSchema = (0, drizzle_zod_1.createInsertSchema)(exports.badServers)
    .extend({
    oldNames: zod_1.z.array(zod_1.z.string()),
})
    .required();
exports.zBadServerRequired = exports.zBadServerSchema.pick({
    id: true,
    name: true,
    type: true,
});
exports.zBadServerMutable = exports.zBadServerSchema
    .omit({
    id: true,
})
    .deepPartial();
exports.zBadServerCreate = exports.zBadServerMutable
    .extend(exports.zBadServerRequired.shape)
    .extend({
    createdBy: zod_1.z.string(),
});
exports.zBadServerUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.badServers).extend({});
exports.zBadServerSelectSchema = (0, drizzle_zod_1.createSelectSchema)(exports.badServers).extend({});
//# sourceMappingURL=bad-servers.js.map