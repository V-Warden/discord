import { z } from "zod";
/**
 * Database Schema Definition
 * Defines the structure of the 'bad_servers' table in PostgreSQL
 */
export declare const badServers: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "bad_servers";
    schema: undefined;
    columns: {
        createdBy: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_by";
            tableName: "bad_servers";
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
            tableName: "bad_servers";
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
            tableName: "bad_servers";
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
            tableName: "bad_servers";
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
            tableName: "bad_servers";
            dataType: "custom";
            columnType: "PgCustomColumn";
            data: string;
            driverParam: unknown;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            pgColumnBuilderBrand: "PgCustomColumnBuilderBrand";
        }>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "bad_servers";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: undefined;
        }>;
        oldNames: import("drizzle-orm/pg-core").PgColumn<{
            name: "old_names";
            tableName: "bad_servers";
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
                name: "old_names";
                tableName: "bad_servers";
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
                name: "old_names";
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
            tableName: "bad_servers";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["CHEATING", "LEAKING", "RESELLING", "ADVERTISING", "OTHER"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        invite: import("drizzle-orm/pg-core").PgColumn<{
            name: "invite";
            tableName: "bad_servers";
            dataType: "string";
            columnType: "PgVarchar";
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
        }, {}, {
            length: undefined;
        }>;
        reason: import("drizzle-orm/pg-core").PgColumn<{
            name: "reason";
            tableName: "bad_servers";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: undefined;
        }>;
    };
    dialect: "pg";
}>;
/**
 * Relations
 * Relations for the notes table
 */
export declare const badServersRelations: import("drizzle-orm").Relations<"bad_servers", {
    imports: import("drizzle-orm").Many<"imports">;
}>;
/**
 * Zod Schema Definitions
 * Type validation schemas for note operations
 */
export declare const zBadServerSchema: z.ZodObject<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["CHEATING", "LEAKING", "RESELLING", "ADVERTISING", "OTHER"]>;
    invite: z.ZodNullable<z.ZodString>;
    reason: z.ZodNullable<z.ZodString>;
    oldNames: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    type: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING";
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    oldNames: string[];
    invite: string | null;
    reason: string | null;
}, {
    name: string;
    id: string;
    type: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING";
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    oldNames: string[];
    invite: string | null;
    reason: string | null;
}>;
export declare const zBadServerRequired: z.ZodObject<Pick<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["CHEATING", "LEAKING", "RESELLING", "ADVERTISING", "OTHER"]>;
    invite: z.ZodNullable<z.ZodString>;
    reason: z.ZodNullable<z.ZodString>;
    oldNames: z.ZodArray<z.ZodString, "many">;
}, "name" | "id" | "type">, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    type: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING";
}, {
    name: string;
    id: string;
    type: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING";
}>;
export declare const zBadServerMutable: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["CHEATING", "LEAKING", "RESELLING", "ADVERTISING", "OTHER"]>>;
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    oldNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    invite: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    type?: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING" | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    oldNames?: string[] | undefined;
    invite?: string | null | undefined;
    reason?: string | null | undefined;
}, {
    name?: string | undefined;
    type?: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING" | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    oldNames?: string[] | undefined;
    invite?: string | null | undefined;
    reason?: string | null | undefined;
}>;
export declare const zBadServerCreate: z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["CHEATING", "LEAKING", "RESELLING", "ADVERTISING", "OTHER"]>>;
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    oldNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    invite: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, Pick<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["CHEATING", "LEAKING", "RESELLING", "ADVERTISING", "OTHER"]>;
    invite: z.ZodNullable<z.ZodString>;
    reason: z.ZodNullable<z.ZodString>;
    oldNames: z.ZodArray<z.ZodString, "many">;
}, "name" | "id" | "type">>, {
    createdBy: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    type: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING";
    createdBy: string;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    oldNames?: string[] | undefined;
    invite?: string | null | undefined;
    reason?: string | null | undefined;
}, {
    name: string;
    id: string;
    type: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING";
    createdBy: string;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    oldNames?: string[] | undefined;
    invite?: string | null | undefined;
    reason?: string | null | undefined;
}>;
export declare const zBadServerUpdateSchema: z.ZodObject<z.objectUtil.extendShape<{
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    oldNames: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    type: z.ZodOptional<z.ZodEnum<["CHEATING", "LEAKING", "RESELLING", "ADVERTISING", "OTHER"]>>;
    invite: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, {}>, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    id?: string | undefined;
    type?: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING" | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    oldNames?: string[] | null | undefined;
    invite?: string | null | undefined;
    reason?: string | null | undefined;
}, {
    name?: string | undefined;
    id?: string | undefined;
    type?: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING" | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    oldNames?: string[] | null | undefined;
    invite?: string | null | undefined;
    reason?: string | null | undefined;
}>;
export declare const zBadServerSelectSchema: z.ZodObject<z.objectUtil.extendShape<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    id: z.ZodString;
    name: z.ZodString;
    oldNames: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    type: z.ZodEnum<["CHEATING", "LEAKING", "RESELLING", "ADVERTISING", "OTHER"]>;
    invite: z.ZodNullable<z.ZodString>;
    reason: z.ZodNullable<z.ZodString>;
}, {}>, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    type: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING";
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    oldNames: string[] | null;
    invite: string | null;
    reason: string | null;
}, {
    name: string;
    id: string;
    type: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING";
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    oldNames: string[] | null;
    invite: string | null;
    reason: string | null;
}>;
export type BadServerInsert = z.infer<typeof zBadServerCreate>;
export type BadServerUpdate = z.infer<typeof zBadServerUpdateSchema>;
export type BadServerSelect = z.infer<typeof zBadServerSelectSchema>;
//# sourceMappingURL=bad-servers.d.ts.map