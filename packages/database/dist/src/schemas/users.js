"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zUserSelectSchema = exports.zUserUpdateSchema = exports.zUserCreate = exports.zUserMutable = exports.zUserRequired = exports.zUserSchema = exports.usersRelations = exports.users = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const common_columns_1 = require("./common-columns");
const custom_types_1 = require("./custom-types");
const notes_1 = require("./notes");
/**
 * Database Schema Definition
 * Defines the structure of the 'users' table in PostgreSQL
 */
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, custom_types_1.snowflake)().primaryKey(),
    last_username: (0, pg_core_1.varchar)().notNull(),
    appeals: (0, pg_core_1.integer)().notNull().default(0),
    first_appeal: (0, pg_core_1.timestamp)(),
    last_appeal: (0, pg_core_1.timestamp)(),
    status: (0, custom_types_1.userStatus)().notNull().default("BLACKLISTED"),
    type: (0, custom_types_1.userType)().notNull(),
    // Audit Columns
    ...common_columns_1.updatedAndCreatedAt,
    ...common_columns_1.auditColumns,
});
/**
 * Relations
 * Relations for the users table
 */
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    notes: many(notes_1.notes),
}));
/**
 * Zod Schema Definitions
 * Type validation schemas for user operations
 */
exports.zUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users)
    .extend({
    id: zod_1.z.string(),
})
    .required();
exports.zUserRequired = exports.zUserSchema.pick({
    id: true,
    last_username: true,
    type: true,
});
exports.zUserMutable = exports.zUserSchema
    .omit({
    id: true,
})
    .deepPartial();
exports.zUserCreate = exports.zUserMutable.extend(exports.zUserRequired.shape);
exports.zUserUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.users).extend({});
exports.zUserSelectSchema = (0, drizzle_zod_1.createSelectSchema)(exports.users).extend({});
//# sourceMappingURL=users.js.map