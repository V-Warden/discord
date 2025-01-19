/**
 * Common Columns
 * Common columns for the database
 */
/**
 * Updated and Created At
 * Columns for the updated and created at timestamps
 */
export declare const updatedAndCreatedAt: {
    createdAt: import("drizzle-orm", { with: { "resolution-mode": "import" } }).HasDefault<import("drizzle-orm/pg-core").PgTimestampBuilderInitial<"created_at">>;
    updatedAt: import("drizzle-orm").HasDefault<import("drizzle-orm/pg-core").PgTimestampBuilderInitial<"updated_at">>;
};
/**
 * Audit Columns
 * Columns for the audit columns
 * @see https://github.com/drizzle-team/drizzle-orm/blob/master/examples/postgres/audit-columns/index.ts
 */
export declare const auditColumns: {
    createdBy: import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
        name: "created_by";
        dataType: "custom";
        columnType: "PgCustomColumn";
        data: string;
        driverParam: unknown;
        enumValues: undefined;
    }>;
    updatedBy: import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
        name: "updated_by";
        dataType: "custom";
        columnType: "PgCustomColumn";
        data: string;
        driverParam: unknown;
        enumValues: undefined;
    }>;
};
//# sourceMappingURL=common-columns.d.ts.map