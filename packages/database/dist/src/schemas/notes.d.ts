import { z } from "zod";
/**
 * Database Schema Definition
 * Defines the structure of the 'notes' table in PostgreSQL
 */
export declare const notes: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "notes";
    schema: undefined;
    columns: {
        createdBy: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_by";
            tableName: "notes";
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
            tableName: "notes";
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
            tableName: "notes";
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
            tableName: "notes";
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
            tableName: "notes";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: "always";
            generated: undefined;
        }, {}, {}>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "notes";
            dataType: "custom";
            columnType: "PgCustomColumn";
            data: string;
            driverParam: unknown;
            notNull: true;
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
        note: import("drizzle-orm/pg-core").PgColumn<{
            name: "note";
            tableName: "notes";
            dataType: "string";
            columnType: "PgText";
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
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Relations
 * Relations for the notes table
 */
export declare const notesRelations: import("drizzle-orm").Relations<"notes", {
    user: import("drizzle-orm").One<"users", true>;
}>;
/**
 * Zod Schema Definitions
 * Type validation schemas for note operations
 */
export declare const zNoteSchema: z.ZodObject<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    userId: z.ZodString;
    note: z.ZodString;
    user_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user_id: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: string;
    note: string;
}, {
    user_id: string;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: string;
    note: string;
}>;
export declare const zNoteRequired: z.ZodObject<Pick<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    userId: z.ZodString;
    note: z.ZodString;
    user_id: z.ZodString;
}, "userId" | "note">, "strip", z.ZodTypeAny, {
    userId: string;
    note: string;
}, {
    userId: string;
    note: string;
}>;
export declare const zNoteMutable: z.ZodObject<{
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    userId: z.ZodOptional<z.ZodString>;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    userId?: string | undefined;
    note?: string | undefined;
}, {
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    userId?: string | undefined;
    note?: string | undefined;
}>;
export declare const zNoteCreate: z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    userId: z.ZodOptional<z.ZodString>;
    note: z.ZodOptional<z.ZodString>;
}, Pick<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    userId: z.ZodString;
    note: z.ZodString;
    user_id: z.ZodString;
}, "userId" | "note">>, {
    createdBy: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    createdBy: string;
    userId: string;
    note: string;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}, {
    createdBy: string;
    userId: string;
    note: string;
    updatedBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}>;
export declare const zNoteUpdateSchema: z.ZodObject<z.objectUtil.extendShape<{
    createdBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    userId: z.ZodOptional<z.ZodString>;
    note: z.ZodOptional<z.ZodString>;
}, {
    updatedBy: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    updatedBy: string;
    createdBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    userId?: string | undefined;
    note?: string | undefined;
}, {
    updatedBy: string;
    createdBy?: string | null | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    userId?: string | undefined;
    note?: string | undefined;
}>;
export declare const zNoteSelectSchema: z.ZodObject<z.objectUtil.extendShape<{
    createdBy: z.ZodNullable<z.ZodString>;
    updatedBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    id: z.ZodNumber;
    userId: z.ZodString;
    note: z.ZodString;
}, {}>, "strip", z.ZodTypeAny, {
    id: number;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: string;
    note: string;
}, {
    id: number;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: string;
    note: string;
}>;
export type NoteInsert = z.infer<typeof zNoteCreate>;
export type NoteUpdate = z.infer<typeof zNoteUpdateSchema>;
export type NoteSelect = z.infer<typeof zNoteSelectSchema>;
//# sourceMappingURL=notes.d.ts.map