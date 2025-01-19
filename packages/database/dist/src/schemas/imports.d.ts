import { z } from "zod";
/**
 * Database Schema Definition
 * Defines the structure of the 'imports' table in PostgreSQL
 */
export declare const imports: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "imports";
    schema: undefined;
    columns: {
        createdBy: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_by";
            tableName: "imports";
            dataType: "custom";
            columnType: "PgCustomColumn";
            data: string;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            pgColumnBuilderBrand: "PgCustomColumnBuilderBrand";
        }>;
        updatedBy: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_by";
            tableName: "imports";
            dataType: "custom";
            columnType: "PgCustomColumn";
            data: string;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            pgColumnBuilderBrand: "PgCustomColumnBuilderBrand";
        }>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "imports";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "imports";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "imports";
            dataType: "custom";
            columnType: "PgCustomColumn";
            data: string;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            pgColumnBuilderBrand: "PgCustomColumnBuilderBrand";
        }>;
        server: import("drizzle-orm/pg-core").PgColumn<{
            name: "server_id";
            tableName: "imports";
            dataType: "custom";
            columnType: "PgCustomColumn";
            data: string;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            pgColumnBuilderBrand: "PgCustomColumnBuilderBrand";
        }>;
        roles: import("drizzle-orm/pg-core").PgColumn<{
            name: "roles";
            tableName: "imports";
            dataType: "array";
            columnType: "PgArray";
            data: string[];
            driverParam: string | string[];
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: import("drizzle-orm").Column<{
                name: "";
                tableName: "imports";
                dataType: "string";
                columnType: "PgText";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: [string, ...string[]];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            }, {}, {}>;
            identity: undefined;
            generated: undefined;
        }, {}, {
            baseBuilder: import("drizzle-orm/pg-core").PgColumnBuilder<{
                name: "";
                dataType: "string";
                columnType: "PgText";
                data: string;
                enumValues: [string, ...string[]];
                driverParam: string;
            }, {}, {}, import("drizzle-orm").ColumnBuilderExtraConfig>;
            size: undefined;
        }>;
        type: import("drizzle-orm/pg-core").PgColumn<{
            name: "type";
            tableName: "imports";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT";
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        appealed: import("drizzle-orm/pg-core").PgColumn<{
            name: "appealed";
            tableName: "imports";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Relations
 * Relations for the notes table
 */
export declare const importsRelations: import("drizzle-orm").Relations<"imports", {
    user: import("drizzle-orm").One<"users", false>;
    badServer: import("drizzle-orm").One<"bad_servers", false>;
}>;
/**
 * Zod Schema Definitions
 * Type validation schemas for note operations
 */
export declare const zImportSchema: z.ZodObject<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    roles: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    type: z.ZodNullable<z.ZodEnum<["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"]>>;
    appealed: z.ZodNullable<z.ZodBoolean>;
    id: z.ZodString;
    server: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    server: string;
    roles: string[] | null;
    appealed: boolean | null;
}, {
    id: string;
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    server: string;
    roles: string[] | null;
    appealed: boolean | null;
}>;
export declare const zImportRequired: z.ZodObject<Pick<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    roles: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    type: z.ZodNullable<z.ZodEnum<["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"]>>;
    appealed: z.ZodNullable<z.ZodBoolean>;
    id: z.ZodString;
    server: z.ZodString;
}, "id" | "type" | "server" | "roles">, "strip", z.ZodTypeAny, {
    id: string;
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | null;
    server: string;
    roles: string[] | null;
}, {
    id: string;
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | null;
    server: string;
    roles: string[] | null;
}>;
export declare const zImportMutable: z.ZodObject<{
    type: z.ZodOptional<z.ZodNullable<z.ZodEnum<["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"]>>>;
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    roles: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    appealed: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    type?: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | null | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    roles?: string[] | null | undefined;
    appealed?: boolean | null | undefined;
}, {
    type?: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | null | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    roles?: string[] | null | undefined;
    appealed?: boolean | null | undefined;
}>;
export declare const zImportCreate: z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    type: z.ZodOptional<z.ZodNullable<z.ZodEnum<["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"]>>>;
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    roles: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    appealed: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
}, Pick<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    roles: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    type: z.ZodNullable<z.ZodEnum<["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"]>>;
    appealed: z.ZodNullable<z.ZodBoolean>;
    id: z.ZodString;
    server: z.ZodString;
}, "id" | "type" | "server" | "roles">>, {
    createdBy: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    id: string;
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | null;
    createdBy: string;
    server: string;
    roles: string[] | null;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    appealed?: boolean | null | undefined;
}, {
    id: string;
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | null;
    createdBy: string;
    server: string;
    roles: string[] | null;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    appealed?: boolean | null | undefined;
}>;
export declare const zImportUpdateSchema: z.ZodObject<z.objectUtil.extendShape<{
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    server: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    roles: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    type: z.ZodOptional<z.ZodNullable<z.ZodEnum<["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"]>>>;
    appealed: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
}, {}>, "strip", z.ZodTypeAny, {
    id?: string | null | undefined;
    type?: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | null | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    server?: string | null | undefined;
    roles?: string[] | null | undefined;
    appealed?: boolean | null | undefined;
}, {
    id?: string | null | undefined;
    type?: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | null | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    server?: string | null | undefined;
    roles?: string[] | null | undefined;
    appealed?: boolean | null | undefined;
}>;
export declare const zImportSelectSchema: z.ZodObject<z.objectUtil.extendShape<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    id: z.ZodNullable<z.ZodString>;
    server: z.ZodNullable<z.ZodString>;
    roles: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    type: z.ZodNullable<z.ZodEnum<["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"]>>;
    appealed: z.ZodNullable<z.ZodBoolean>;
}, {}>, "strip", z.ZodTypeAny, {
    id: string | null;
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    server: string | null;
    roles: string[] | null;
    appealed: boolean | null;
}, {
    id: string | null;
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    server: string | null;
    roles: string[] | null;
    appealed: boolean | null;
}>;
export type ImportInsert = z.infer<typeof zImportSchema>;
export type ImportUpdate = z.infer<typeof zImportUpdateSchema>;
export type ImportSelect = z.infer<typeof zImportSelectSchema>;
//# sourceMappingURL=imports.d.ts.map