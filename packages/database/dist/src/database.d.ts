import "dotenv/config";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
export declare const dbSchema: {
    users: import("drizzle-orm/pg-core").PgTableWithColumns<{
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
};
export declare const db: NodePgDatabase<typeof dbSchema>;
//# sourceMappingURL=database.d.ts.map