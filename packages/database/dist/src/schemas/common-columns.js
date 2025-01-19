"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditColumns = exports.updatedAndCreatedAt = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const custom_types_1 = require("./custom-types");
/**
 * Common Columns
 * Common columns for the database
 */
/**
 * Updated and Created At
 * Columns for the updated and created at timestamps
 */
exports.updatedAndCreatedAt = {
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", {
        mode: "date",
        precision: 3,
    }).$onUpdate(() => new Date()),
};
/**
 * Audit Columns
 * Columns for the audit columns
 * @see https://github.com/drizzle-team/drizzle-orm/blob/master/examples/postgres/audit-columns/index.ts
 */
exports.auditColumns = {
    createdBy: (0, custom_types_1.snowflake)("created_by"),
    updatedBy: (0, custom_types_1.snowflake)("updated_by"),
};
//# sourceMappingURL=common-columns.js.map