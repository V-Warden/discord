"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zNoteSelectSchema = exports.zNoteUpdateSchema = exports.zNoteCreate = exports.zNoteMutable = exports.zNoteRequired = exports.zNoteSchema = exports.notesRelations = exports.notes = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const common_columns_1 = require("./common-columns");
const custom_types_1 = require("./custom-types");
const users_1 = require("./users");
/**
 * Database Schema Definition
 * Defines the structure of the 'notes' table in PostgreSQL
 */
exports.notes = (0, pg_core_1.pgTable)("notes", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    userId: (0, custom_types_1.snowflake)("user_id")
        .notNull()
        .references(() => users_1.users.id, { onDelete: "restrict", onUpdate: "restrict" }),
    note: (0, pg_core_1.text)().notNull(),
    // Audit Columns
    ...common_columns_1.updatedAndCreatedAt,
    ...common_columns_1.auditColumns,
});
/**
 * Relations
 * Relations for the notes table
 */
exports.notesRelations = (0, drizzle_orm_1.relations)(exports.notes, ({ one }) => ({
    user: one(users_1.users, {
        fields: [exports.notes.userId],
        references: [users_1.users.id],
    }),
}));
/**
 * Zod Schema Definitions
 * Type validation schemas for note operations
 */
exports.zNoteSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notes)
    .extend({
    user_id: zod_1.z.string(),
})
    .required();
exports.zNoteRequired = exports.zNoteSchema.pick({
    userId: true,
    note: true,
});
exports.zNoteMutable = exports.zNoteSchema
    .omit({
    user_id: true,
})
    .deepPartial();
exports.zNoteCreate = exports.zNoteMutable.extend(exports.zNoteRequired.shape).extend({
    createdBy: zod_1.z.string(),
});
exports.zNoteUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.notes).extend({
    updatedBy: zod_1.z.string(),
});
exports.zNoteSelectSchema = (0, drizzle_zod_1.createSelectSchema)(exports.notes).extend({});
//# sourceMappingURL=notes.js.map