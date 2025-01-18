import { customType } from "drizzle-orm/pg-core";

export const snowflake = customType<{
	data: string;
}>({
	dataType() {
		return "bigint";
	},
	// @ts-ignore
	fromDriver(value: string) {
		return value.toString();
	},
});
