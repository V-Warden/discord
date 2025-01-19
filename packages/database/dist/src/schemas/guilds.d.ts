import { z } from "zod";
/**
 * Database Schema Definition
 * Defines the structure of the 'guilds' table in PostgreSQL
 */
export declare const guilds: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "guilds";
    schema: undefined;
    columns: {
        createdBy: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_by";
            tableName: "guilds";
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
            tableName: "guilds";
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
            tableName: "guilds";
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
            tableName: "guilds";
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
            tableName: "guilds";
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
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "guilds";
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
        logChannelId: import("drizzle-orm/pg-core").PgColumn<{
            name: "logChannelId";
            tableName: "guilds";
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
    };
    dialect: "pg";
}>;
/**
 * Relations
 * Relations for the guilds table
 */
export declare const guildsRelations: import("drizzle-orm").Relations<"guilds", {
    punishments: import("drizzle-orm").One<"punishments", false>;
}>;
/**
 * Zod Schema Definitions
 * Type validation schemas for note operations
 */
export declare const zGuildSchema: z.ZodObject<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    name: z.ZodNullable<z.ZodString>;
    logChannelId: z.ZodNullable<z.ZodString>;
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string | null;
    id: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    logChannelId: string | null;
}, {
    name: string | null;
    id: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    logChannelId: string | null;
}>;
export declare const zGuildRequired: z.ZodObject<Pick<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    name: z.ZodNullable<z.ZodString>;
    logChannelId: z.ZodNullable<z.ZodString>;
    id: z.ZodString;
}, "name" | "id">, "strip", z.ZodTypeAny, {
    name: string | null;
    id: string;
}, {
    name: string | null;
    id: string;
}>;
export declare const zGuildMutable: z.ZodObject<{
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    logChannelId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | null | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    logChannelId?: string | null | undefined;
}, {
    name?: string | null | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    logChannelId?: string | null | undefined;
}>;
export declare const zGuildCreate: z.ZodObject<z.objectUtil.extendShape<{
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    logChannelId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, Pick<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    name: z.ZodNullable<z.ZodString>;
    logChannelId: z.ZodNullable<z.ZodString>;
    id: z.ZodString;
}, "name" | "id">>, "strip", z.ZodTypeAny, {
    name: string | null;
    id: string;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    logChannelId?: string | null | undefined;
}, {
    name: string | null;
    id: string;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    logChannelId?: string | null | undefined;
}>;
export declare const zGuildUpdateSchema: z.ZodObject<z.objectUtil.extendShape<{
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    logChannelId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, {}>, "strip", z.ZodTypeAny, {
    name?: string | null | undefined;
    id?: string | null | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    logChannelId?: string | null | undefined;
}, {
    name?: string | null | undefined;
    id?: string | null | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    logChannelId?: string | null | undefined;
}>;
export declare const zGuildSelectSchema: z.ZodObject<z.objectUtil.extendShape<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    id: z.ZodNullable<z.ZodString>;
    name: z.ZodNullable<z.ZodString>;
    logChannelId: z.ZodNullable<z.ZodString>;
}, {}>, "strip", z.ZodTypeAny, {
    name: string | null;
    id: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    logChannelId: string | null;
}, {
    name: string | null;
    id: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    logChannelId: string | null;
}>;
export type GuildInsert = z.infer<typeof zGuildCreate>;
export type GuildUpdate = z.infer<typeof zGuildUpdateSchema>;
export type GuildSelect = z.infer<typeof zGuildSelectSchema>;
//# sourceMappingURL=guilds.d.ts.map