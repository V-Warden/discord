import { z } from "zod";
/**
 * Database Schema Definition
 * Defines the structure of the 'punishments' table in PostgreSQL
 */
export declare const punishments: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "punishments";
    schema: undefined;
    columns: {
        createdBy: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_by";
            tableName: "punishments";
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
            tableName: "punishments";
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
            tableName: "punishments";
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
            tableName: "punishments";
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
            tableName: "punishments";
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
        enabled: import("drizzle-orm/pg-core").PgColumn<{
            name: "enabled";
            tableName: "punishments";
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
        roleId: import("drizzle-orm/pg-core").PgColumn<{
            name: "roleId";
            tableName: "punishments";
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
        unban: import("drizzle-orm/pg-core").PgColumn<{
            name: "unban";
            tableName: "punishments";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
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
        owner: import("drizzle-orm/pg-core").PgColumn<{
            name: "owner";
            tableName: "punishments";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "BAN" | "KICK" | "WARN" | "ROLE";
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["BAN", "KICK", "WARN", "ROLE"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        supporter: import("drizzle-orm/pg-core").PgColumn<{
            name: "supporter";
            tableName: "punishments";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "BAN" | "KICK" | "WARN" | "ROLE";
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["BAN", "KICK", "WARN", "ROLE"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        leaker: import("drizzle-orm/pg-core").PgColumn<{
            name: "leaker";
            tableName: "punishments";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "BAN" | "KICK" | "WARN" | "ROLE";
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["BAN", "KICK", "WARN", "ROLE"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        cheater: import("drizzle-orm/pg-core").PgColumn<{
            name: "cheater";
            tableName: "punishments";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "BAN" | "KICK" | "WARN" | "ROLE";
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["BAN", "KICK", "WARN", "ROLE"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        other: import("drizzle-orm/pg-core").PgColumn<{
            name: "other";
            tableName: "punishments";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "BAN" | "KICK" | "WARN" | "ROLE";
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["BAN", "KICK", "WARN", "ROLE"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Relations
 * Relations for the punishments table
 */
export declare const punishmentsRelations: import("drizzle-orm").Relations<"punishments", {
    guild: import("drizzle-orm").One<"guilds", false>;
}>;
/**
 * Zod Schema Definitions
 * Type validation schemas for punishment operations
 */
export declare const zUnbanSchema: z.ZodObject<{
    enabled: z.ZodBoolean;
    owner: z.ZodBoolean;
    supporter: z.ZodBoolean;
    cheater: z.ZodBoolean;
    leaker: z.ZodBoolean;
    other: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    owner: boolean;
    supporter: boolean;
    leaker: boolean;
    cheater: boolean;
    other: boolean;
}, {
    enabled: boolean;
    owner: boolean;
    supporter: boolean;
    leaker: boolean;
    cheater: boolean;
    other: boolean;
}>;
export declare const zPunishmentSchema: z.ZodObject<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    enabled: z.ZodNullable<z.ZodBoolean>;
    roleId: z.ZodNullable<z.ZodString>;
    unban: z.ZodObject<{
        enabled: z.ZodBoolean;
        owner: z.ZodBoolean;
        supporter: z.ZodBoolean;
        cheater: z.ZodBoolean;
        leaker: z.ZodBoolean;
        other: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    }, {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    }>;
    owner: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    supporter: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    leaker: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    cheater: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    other: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    enabled: boolean | null;
    roleId: string | null;
    unban: {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    };
    owner: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    supporter: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    leaker: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    cheater: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    other: "BAN" | "KICK" | "WARN" | "ROLE" | null;
}, {
    id: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    enabled: boolean | null;
    roleId: string | null;
    unban: {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    };
    owner: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    supporter: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    leaker: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    cheater: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    other: "BAN" | "KICK" | "WARN" | "ROLE" | null;
}>;
export declare const zPunishmentRequired: z.ZodObject<Pick<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    enabled: z.ZodNullable<z.ZodBoolean>;
    roleId: z.ZodNullable<z.ZodString>;
    unban: z.ZodObject<{
        enabled: z.ZodBoolean;
        owner: z.ZodBoolean;
        supporter: z.ZodBoolean;
        cheater: z.ZodBoolean;
        leaker: z.ZodBoolean;
        other: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    }, {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    }>;
    owner: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    supporter: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    leaker: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    cheater: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    other: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    id: z.ZodString;
}, "id">, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const zPunishmentMutable: z.ZodObject<{
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    enabled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    roleId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unban: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        owner: z.ZodOptional<z.ZodBoolean>;
        supporter: z.ZodOptional<z.ZodBoolean>;
        cheater: z.ZodOptional<z.ZodBoolean>;
        leaker: z.ZodOptional<z.ZodBoolean>;
        other: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean | undefined;
        owner?: boolean | undefined;
        supporter?: boolean | undefined;
        leaker?: boolean | undefined;
        cheater?: boolean | undefined;
        other?: boolean | undefined;
    }, {
        enabled?: boolean | undefined;
        owner?: boolean | undefined;
        supporter?: boolean | undefined;
        leaker?: boolean | undefined;
        cheater?: boolean | undefined;
        other?: boolean | undefined;
    }>>;
    owner: z.ZodOptional<z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>>;
    supporter: z.ZodOptional<z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>>;
    leaker: z.ZodOptional<z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>>;
    cheater: z.ZodOptional<z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>>;
    other: z.ZodOptional<z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>>;
}, "strip", z.ZodTypeAny, {
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    enabled?: boolean | null | undefined;
    roleId?: string | null | undefined;
    unban?: {
        enabled?: boolean | undefined;
        owner?: boolean | undefined;
        supporter?: boolean | undefined;
        leaker?: boolean | undefined;
        cheater?: boolean | undefined;
        other?: boolean | undefined;
    } | undefined;
    owner?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    supporter?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    leaker?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    cheater?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    other?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
}, {
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    enabled?: boolean | null | undefined;
    roleId?: string | null | undefined;
    unban?: {
        enabled?: boolean | undefined;
        owner?: boolean | undefined;
        supporter?: boolean | undefined;
        leaker?: boolean | undefined;
        cheater?: boolean | undefined;
        other?: boolean | undefined;
    } | undefined;
    owner?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    supporter?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    leaker?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    cheater?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    other?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
}>;
export declare const zPunishmentCreate: z.ZodObject<z.objectUtil.extendShape<{
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    enabled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    roleId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unban: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        owner: z.ZodOptional<z.ZodBoolean>;
        supporter: z.ZodOptional<z.ZodBoolean>;
        cheater: z.ZodOptional<z.ZodBoolean>;
        leaker: z.ZodOptional<z.ZodBoolean>;
        other: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean | undefined;
        owner?: boolean | undefined;
        supporter?: boolean | undefined;
        leaker?: boolean | undefined;
        cheater?: boolean | undefined;
        other?: boolean | undefined;
    }, {
        enabled?: boolean | undefined;
        owner?: boolean | undefined;
        supporter?: boolean | undefined;
        leaker?: boolean | undefined;
        cheater?: boolean | undefined;
        other?: boolean | undefined;
    }>>;
    owner: z.ZodOptional<z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>>;
    supporter: z.ZodOptional<z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>>;
    leaker: z.ZodOptional<z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>>;
    cheater: z.ZodOptional<z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>>;
    other: z.ZodOptional<z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>>;
}, Pick<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    enabled: z.ZodNullable<z.ZodBoolean>;
    roleId: z.ZodNullable<z.ZodString>;
    unban: z.ZodObject<{
        enabled: z.ZodBoolean;
        owner: z.ZodBoolean;
        supporter: z.ZodBoolean;
        cheater: z.ZodBoolean;
        leaker: z.ZodBoolean;
        other: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    }, {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    }>;
    owner: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    supporter: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    leaker: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    cheater: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    other: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    id: z.ZodString;
}, "id">>, "strip", z.ZodTypeAny, {
    id: string;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    enabled?: boolean | null | undefined;
    roleId?: string | null | undefined;
    unban?: {
        enabled?: boolean | undefined;
        owner?: boolean | undefined;
        supporter?: boolean | undefined;
        leaker?: boolean | undefined;
        cheater?: boolean | undefined;
        other?: boolean | undefined;
    } | undefined;
    owner?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    supporter?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    leaker?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    cheater?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    other?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
}, {
    id: string;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    enabled?: boolean | null | undefined;
    roleId?: string | null | undefined;
    unban?: {
        enabled?: boolean | undefined;
        owner?: boolean | undefined;
        supporter?: boolean | undefined;
        leaker?: boolean | undefined;
        cheater?: boolean | undefined;
        other?: boolean | undefined;
    } | undefined;
    owner?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    supporter?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    leaker?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    cheater?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    other?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
}>;
export declare const zPunishmentUpdateSchema: z.ZodObject<z.objectUtil.extendShape<{
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    enabled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    roleId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unban: z.ZodObject<{
        enabled: z.ZodBoolean;
        owner: z.ZodBoolean;
        supporter: z.ZodBoolean;
        cheater: z.ZodBoolean;
        leaker: z.ZodBoolean;
        other: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    }, {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    }>;
    owner: z.ZodOptional<z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>>;
    supporter: z.ZodOptional<z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>>;
    leaker: z.ZodOptional<z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>>;
    cheater: z.ZodOptional<z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>>;
    other: z.ZodOptional<z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>>;
}, {}>, "strip", z.ZodTypeAny, {
    unban: {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    };
    id?: string | null | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    enabled?: boolean | null | undefined;
    roleId?: string | null | undefined;
    owner?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    supporter?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    leaker?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    cheater?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    other?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
}, {
    unban: {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    };
    id?: string | null | undefined;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    enabled?: boolean | null | undefined;
    roleId?: string | null | undefined;
    owner?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    supporter?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    leaker?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    cheater?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
    other?: "BAN" | "KICK" | "WARN" | "ROLE" | null | undefined;
}>;
export declare const zPunishmentSelectSchema: z.ZodObject<z.objectUtil.extendShape<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    id: z.ZodNullable<z.ZodString>;
    enabled: z.ZodNullable<z.ZodBoolean>;
    roleId: z.ZodNullable<z.ZodString>;
    unban: z.ZodObject<{
        enabled: z.ZodBoolean;
        owner: z.ZodBoolean;
        supporter: z.ZodBoolean;
        cheater: z.ZodBoolean;
        leaker: z.ZodBoolean;
        other: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    }, {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    }>;
    owner: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    supporter: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    leaker: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    cheater: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
    other: z.ZodNullable<z.ZodEnum<["BAN", "KICK", "WARN", "ROLE"]>>;
}, {}>, "strip", z.ZodTypeAny, {
    id: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    enabled: boolean | null;
    roleId: string | null;
    unban: {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    };
    owner: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    supporter: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    leaker: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    cheater: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    other: "BAN" | "KICK" | "WARN" | "ROLE" | null;
}, {
    id: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    enabled: boolean | null;
    roleId: string | null;
    unban: {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    };
    owner: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    supporter: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    leaker: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    cheater: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    other: "BAN" | "KICK" | "WARN" | "ROLE" | null;
}>;
export type PunishmentInsert = z.infer<typeof zPunishmentCreate>;
export type PunishmentUpdate = z.infer<typeof zPunishmentUpdateSchema>;
export type PunishmentSelect = z.infer<typeof zPunishmentSelectSchema>;
//# sourceMappingURL=punishments.d.ts.map