import { z } from "zod";
/**
 * Database Schema Definition
 * Defines the structure of the 'users' table in PostgreSQL
 */
export declare const users: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "users";
    schema: undefined;
    columns: {
        createdBy: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_by";
            tableName: "users";
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
            tableName: "users";
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
            tableName: "users";
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
            tableName: "users";
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
            tableName: "users";
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
        last_username: import("drizzle-orm/pg-core").PgColumn<{
            name: "last_username";
            tableName: "users";
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
        appeals: import("drizzle-orm/pg-core").PgColumn<{
            name: "appeals";
            tableName: "users";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        first_appeal: import("drizzle-orm/pg-core").PgColumn<{
            name: "first_appeal";
            tableName: "users";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        last_appeal: import("drizzle-orm/pg-core").PgColumn<{
            name: "last_appeal";
            tableName: "users";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "users";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "APPEALED" | "BLACKLISTED" | "PERM_BLACKLISTED" | "WHITELISTED";
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["APPEALED", "BLACKLISTED", "PERM_BLACKLISTED", "WHITELISTED"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        type: import("drizzle-orm/pg-core").PgColumn<{
            name: "type";
            tableName: "users";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Relations
 * Relations for the users table
 */
export declare const usersRelations: import("drizzle-orm").Relations<"users", {
    notes: import("drizzle-orm").Many<"notes">;
}>;
/**
 * Zod Schema Definitions
 * Type validation schemas for user operations
 */
export declare const zUserSchema: z.ZodObject<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    last_username: z.ZodString;
    appeals: z.ZodNumber;
    first_appeal: z.ZodNullable<z.ZodDate>;
    last_appeal: z.ZodNullable<z.ZodDate>;
    status: z.ZodEnum<["APPEALED", "BLACKLISTED", "PERM_BLACKLISTED", "WHITELISTED"]>;
    type: z.ZodEnum<["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"]>;
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    last_username: string;
    appeals: number;
    first_appeal: Date | null;
    last_appeal: Date | null;
    status: "APPEALED" | "BLACKLISTED" | "PERM_BLACKLISTED" | "WHITELISTED";
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT";
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}, {
    id: string;
    last_username: string;
    appeals: number;
    first_appeal: Date | null;
    last_appeal: Date | null;
    status: "APPEALED" | "BLACKLISTED" | "PERM_BLACKLISTED" | "WHITELISTED";
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT";
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
export declare const zUserRequired: z.ZodObject<Pick<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    last_username: z.ZodString;
    appeals: z.ZodNumber;
    first_appeal: z.ZodNullable<z.ZodDate>;
    last_appeal: z.ZodNullable<z.ZodDate>;
    status: z.ZodEnum<["APPEALED", "BLACKLISTED", "PERM_BLACKLISTED", "WHITELISTED"]>;
    type: z.ZodEnum<["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"]>;
    id: z.ZodString;
}, "id" | "last_username" | "type">, "strip", z.ZodTypeAny, {
    id: string;
    last_username: string;
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT";
}, {
    id: string;
    last_username: string;
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT";
}>;
export declare const zUserMutable: z.ZodObject<{
    last_username: z.ZodOptional<z.ZodString>;
    appeals: z.ZodOptional<z.ZodNumber>;
    first_appeal: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    last_appeal: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    status: z.ZodOptional<z.ZodEnum<["APPEALED", "BLACKLISTED", "PERM_BLACKLISTED", "WHITELISTED"]>>;
    type: z.ZodOptional<z.ZodEnum<["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"]>>;
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    last_username?: string | undefined;
    appeals?: number | undefined;
    first_appeal?: Date | null | undefined;
    last_appeal?: Date | null | undefined;
    status?: "APPEALED" | "BLACKLISTED" | "PERM_BLACKLISTED" | "WHITELISTED" | undefined;
    type?: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}, {
    last_username?: string | undefined;
    appeals?: number | undefined;
    first_appeal?: Date | null | undefined;
    last_appeal?: Date | null | undefined;
    status?: "APPEALED" | "BLACKLISTED" | "PERM_BLACKLISTED" | "WHITELISTED" | undefined;
    type?: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}>;
export declare const zUserCreate: z.ZodObject<z.objectUtil.extendShape<{
    last_username: z.ZodOptional<z.ZodString>;
    appeals: z.ZodOptional<z.ZodNumber>;
    first_appeal: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    last_appeal: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    status: z.ZodOptional<z.ZodEnum<["APPEALED", "BLACKLISTED", "PERM_BLACKLISTED", "WHITELISTED"]>>;
    type: z.ZodOptional<z.ZodEnum<["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"]>>;
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, Pick<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    last_username: z.ZodString;
    appeals: z.ZodNumber;
    first_appeal: z.ZodNullable<z.ZodDate>;
    last_appeal: z.ZodNullable<z.ZodDate>;
    status: z.ZodEnum<["APPEALED", "BLACKLISTED", "PERM_BLACKLISTED", "WHITELISTED"]>;
    type: z.ZodEnum<["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"]>;
    id: z.ZodString;
}, "id" | "last_username" | "type">>, "strip", z.ZodTypeAny, {
    id: string;
    last_username: string;
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT";
    appeals?: number | undefined;
    first_appeal?: Date | null | undefined;
    last_appeal?: Date | null | undefined;
    status?: "APPEALED" | "BLACKLISTED" | "PERM_BLACKLISTED" | "WHITELISTED" | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}, {
    id: string;
    last_username: string;
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT";
    appeals?: number | undefined;
    first_appeal?: Date | null | undefined;
    last_appeal?: Date | null | undefined;
    status?: "APPEALED" | "BLACKLISTED" | "PERM_BLACKLISTED" | "WHITELISTED" | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}>;
export declare const zUserUpdateSchema: z.ZodObject<z.objectUtil.extendShape<{
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    id: z.ZodOptional<z.ZodString>;
    last_username: z.ZodOptional<z.ZodString>;
    appeals: z.ZodOptional<z.ZodNumber>;
    first_appeal: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    last_appeal: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    status: z.ZodOptional<z.ZodEnum<["APPEALED", "BLACKLISTED", "PERM_BLACKLISTED", "WHITELISTED"]>>;
    type: z.ZodOptional<z.ZodEnum<["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"]>>;
}, {}>, "strip", z.ZodTypeAny, {
    id?: string | undefined;
    last_username?: string | undefined;
    appeals?: number | undefined;
    first_appeal?: Date | null | undefined;
    last_appeal?: Date | null | undefined;
    status?: "APPEALED" | "BLACKLISTED" | "PERM_BLACKLISTED" | "WHITELISTED" | undefined;
    type?: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}, {
    id?: string | undefined;
    last_username?: string | undefined;
    appeals?: number | undefined;
    first_appeal?: Date | null | undefined;
    last_appeal?: Date | null | undefined;
    status?: "APPEALED" | "BLACKLISTED" | "PERM_BLACKLISTED" | "WHITELISTED" | undefined;
    type?: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}>;
export declare const zUserSelectSchema: z.ZodObject<z.objectUtil.extendShape<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    id: z.ZodString;
    last_username: z.ZodString;
    appeals: z.ZodNumber;
    first_appeal: z.ZodNullable<z.ZodDate>;
    last_appeal: z.ZodNullable<z.ZodDate>;
    status: z.ZodEnum<["APPEALED", "BLACKLISTED", "PERM_BLACKLISTED", "WHITELISTED"]>;
    type: z.ZodEnum<["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"]>;
}, {}>, "strip", z.ZodTypeAny, {
    id: string;
    last_username: string;
    appeals: number;
    first_appeal: Date | null;
    last_appeal: Date | null;
    status: "APPEALED" | "BLACKLISTED" | "PERM_BLACKLISTED" | "WHITELISTED";
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT";
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}, {
    id: string;
    last_username: string;
    appeals: number;
    first_appeal: Date | null;
    last_appeal: Date | null;
    status: "APPEALED" | "BLACKLISTED" | "PERM_BLACKLISTED" | "WHITELISTED";
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT";
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
export type UserInsert = z.infer<typeof zUserCreate>;
export type UserUpdate = z.infer<typeof zUserUpdateSchema>;
export type UserSelect = z.infer<typeof zUserSelectSchema>;
//# sourceMappingURL=users.d.ts.map