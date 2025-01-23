"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zRoleArchiveSelectSchema = exports.zRoleArchiveUpdateSchema = exports.zRoleArchiveCreate = exports.zRoleArchiveMutable = exports.zRoleArchiveRequired = exports.zRoleArchiveSchema = exports.rolesArchive = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const common_columns_1 = require("./common-columns");
const custom_types_1 = require("./custom-types");
/**
 * Database Schema Definition
 * Defines the structure of the 'roles' table in PostgreSQL
 */
exports.rolesArchive = (0, pg_core_1.pgTable)("roles_archive", {
    userId: (0, custom_types_1.snowflake)("user_id"),
    guildId: (0, custom_types_1.snowflake)("guild_id"),
    roles: (0, pg_core_1.text)().array(),
    // Audit Columns
    ...common_columns_1.updatedAndCreatedAt,
    ...common_columns_1.auditColumns,
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
exports.zRoleArchiveSchema = (0, drizzle_zod_1.createInsertSchema)(exports.rolesArchive, {})
    .extend({
    userId: zod_1.z.string(),
    guildId: zod_1.z.string(),
    roles: zod_1.z.array(zod_1.z.string()),
})
    .required();
exports.zRoleArchiveRequired = exports.zRoleArchiveSchema.pick({
    userId: true,
    guildId: true,
    roles: true,
});
exports.zRoleArchiveMutable = exports.zRoleArchiveSchema
    .omit({
    userId: true,
    guildId: true,
})
    .deepPartial();
exports.zRoleArchiveCreate = exports.zRoleArchiveMutable.extend(exports.zRoleArchiveRequired.shape);
exports.zRoleArchiveUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.rolesArchive, {}).extend({});
exports.zRoleArchiveSelectSchema = (0, drizzle_zod_1.createSelectSchema)(exports.rolesArchive, {}).extend({});
//# sourceMappingURL=roles.js.map