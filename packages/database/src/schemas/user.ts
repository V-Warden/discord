import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { snowflake, userStatus, userType } from "./custom-types";

export const users = pgTable("users", {
	id: snowflake().primaryKey(),
	last_username: varchar("last_username").notNull(),

	appeals: integer("appeals").notNull().default(0),
	first_appeal: timestamp("first_appeal"),
	last_appeal: timestamp("last_appeal"),

	status: userStatus("status").notNull().default("BLACKLISTED"),
	type: userType("type").notNull(),

	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at", {
		mode: "date",
		precision: 3,
	}).$onUpdate(() => new Date()),
});

export const zUserSchema = createInsertSchema(users)
	.extend({
		id: z.string(),
	})
	.required();

export const zUserRequired = zUserSchema.pick({
	id: true,
	last_username: true,
	type: true,
});

export const zUserMutable = zUserSchema
	.omit({
		id: true,
	})
	.deepPartial();

export const zUserCreate = zUserMutable.extend(zUserRequired.shape);

export const zUserUpdateSchema = createUpdateSchema(users).extend({});
export const zUserSelectSchema = createSelectSchema(users).extend({});

export type UserInsert = z.infer<typeof zUserSchema>;
export type UserUpdate = z.infer<typeof zUserUpdateSchema>;
export type UserSelect = z.infer<typeof zUserSelectSchema>;
