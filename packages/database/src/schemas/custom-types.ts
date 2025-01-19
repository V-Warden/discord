import { customType, pgEnum } from "drizzle-orm/pg-core";

/**
 * Custom Types
 * Custom types for the database
 */

export const snowflake = customType<{ data: string }>({
	dataType() {
		return "bigint";
	},
	// @ts-ignore
	fromDriver(value: string) {
		return value.toString();
	},
});

export const userStatus = pgEnum("user_status", [
	"APPEALED",
	"BLACKLISTED",
	"PERM_BLACKLISTED",
	"WHITELISTED",
] as const);

export const userType = pgEnum("user_type", [
	"OTHER",
	"LEAKER",
	"CHEATER",
	"SUPPORTER",
	"OWNER",
	"BOT",
] as const);

export const serverType = pgEnum("server_type", [
	"CHEATING",
	"LEAKING",
	"RESELLING",
	"ADVERTISING",
	"OTHER",
] as const);

export const punishmentType = pgEnum("punishment_type", [
	"BAN",
	"KICK",
	"WARN",
	"ROLE",
] as const);

/**
 * User Type
 * A type for the user type, used for type validation
 */
export type UserType = (typeof userType.enumValues)[number];

export type ServerType = (typeof serverType.enumValues)[number];
