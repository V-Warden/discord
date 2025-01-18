import { z } from "zod";
export declare const users: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "users";
    schema: undefined;
    columns: {
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
    };
    dialect: "pg";
}>;
export declare const zUserSchema: z.ZodObject<{
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}, {
    id: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
export declare const zUserRequired: z.ZodObject<Pick<{
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    id: z.ZodString;
}, "id">, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const zUserMutable: z.ZodObject<{
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}, {
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}>;
export declare const zUserCreate: z.ZodObject<z.objectUtil.extendShape<{
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, Pick<{
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
    id: z.ZodString;
}, "id">>, "strip", z.ZodTypeAny, {
    id: string;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}, {
    id: string;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}>;
export declare const zUserUpdateSchema: z.ZodObject<z.objectUtil.extendShape<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, {}>, "strip", z.ZodTypeAny, {
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}, {
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}>;
export declare const zUserSelectSchema: z.ZodObject<z.objectUtil.extendShape<{
    id: z.ZodString;
    createdAt: z.ZodNullable<z.ZodDate>;
    updatedAt: z.ZodNullable<z.ZodDate>;
}, {}>, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}, {
    id: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
export type UserInsert = z.infer<typeof zUserSchema>;
export type UserUpdate = z.infer<typeof zUserUpdateSchema>;
export type UserSelect = z.infer<typeof zUserSelectSchema>;
//# sourceMappingURL=user.d.ts.map