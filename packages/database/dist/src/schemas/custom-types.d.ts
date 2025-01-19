/**
 * Custom Types
 * Custom types for the database
 */
export declare const snowflake: {
    (): import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
        name: "";
        dataType: "custom";
        columnType: "PgCustomColumn";
        data: string;
        driverParam: unknown;
        enumValues: undefined;
    }>;
    <TConfig extends Record<string, any>>(fieldConfig?: TConfig | undefined): import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
        name: "";
        dataType: "custom";
        columnType: "PgCustomColumn";
        data: string;
        driverParam: unknown;
        enumValues: undefined;
    }>;
    <TName extends string>(dbName: TName, fieldConfig?: unknown): import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
        name: TName;
        dataType: "custom";
        columnType: "PgCustomColumn";
        data: string;
        driverParam: unknown;
        enumValues: undefined;
    }>;
};
export declare const userStatus: import("drizzle-orm/pg-core").PgEnum<["APPEALED", "BLACKLISTED", "PERM_BLACKLISTED", "WHITELISTED"]>;
export declare const userType: import("drizzle-orm/pg-core").PgEnum<["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER", "BOT"]>;
export declare const serverType: import("drizzle-orm/pg-core").PgEnum<["CHEATING", "LEAKING", "RESELLING", "ADVERTISING", "OTHER"]>;
export declare const punishmentType: import("drizzle-orm/pg-core").PgEnum<["BAN", "KICK", "WARN", "ROLE"]>;
/**
 * User Type
 * A type for the user type, used for type validation
 */
export type UserType = (typeof userType.enumValues)[number];
export type ServerType = (typeof serverType.enumValues)[number];
//# sourceMappingURL=custom-types.d.ts.map