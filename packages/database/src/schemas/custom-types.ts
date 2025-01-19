import { customType, pgEnum } from "drizzle-orm/pg-core";

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

export type UserType = (typeof userType.enumValues)[number];
