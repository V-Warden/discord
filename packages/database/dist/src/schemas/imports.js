"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zImportSelectSchema = exports.zImportUpdateSchema = exports.zImportCreate = exports.zImportMutable = exports.zImportRequired = exports.zImportSchema = exports.importsRelations = exports.imports = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const bad_servers_1 = require("./bad-servers");
const common_columns_1 = require("./common-columns");
const custom_types_1 = require("./custom-types");
const users_1 = require("./users");
/**
 * Database Schema Definition
 * Defines the structure of the 'imports' table in PostgreSQL
 */
exports.imports = (0, pg_core_1.pgTable)("imports", {
    id: (0, custom_types_1.snowflake)().references(() => users_1.users.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
    }),
    server: (0, custom_types_1.snowflake)("server_id").references(() => bad_servers_1.badServers.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
    }),
    roles: (0, pg_core_1.text)().array(),
    type: (0, custom_types_1.userType)(),
    appealed: (0, pg_core_1.boolean)().default(false),
    // Audit Columns
    ...common_columns_1.updatedAndCreatedAt,
    ...common_columns_1.auditColumns,
});
/**
 * Relations
 * Relations for the notes table
 */
exports.importsRelations = (0, drizzle_orm_1.relations)(exports.imports, ({ one }) => ({
    user: one(users_1.users, {
        fields: [exports.imports.id],
        references: [users_1.users.id],
    }),
    badServer: one(bad_servers_1.badServers, {
        fields: [exports.imports.server],
        references: [bad_servers_1.badServers.id],
    }),
}));
/**
 * Zod Schema Definitions
 * Type validation schemas for note operations
 */
exports.zImportSchema = (0, drizzle_zod_1.createInsertSchema)(exports.imports)
    .extend({
    id: zod_1.z.string(),
    server: zod_1.z.string(),
})
    .required();
exports.zImportRequired = exports.zImportSchema.pick({
    id: true,
    server: true,
    roles: true,
    type: true,
});
exports.zImportMutable = exports.zImportSchema
    .omit({
    id: true,
    server: true,
})
    .deepPartial();
exports.zImportCreate = exports.zImportMutable
    .extend(exports.zImportRequired.shape)
    .extend({
    createdBy: zod_1.z.string(),
});
exports.zImportUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.imports).extend({});
exports.zImportSelectSchema = (0, drizzle_zod_1.createSelectSchema)(exports.imports).extend({});
//# sourceMappingURL=imports.js.map