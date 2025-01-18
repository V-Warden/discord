import { pgTable, timestamp } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { snowflake } from "./custom-types";

export const users = pgTable("users", {
	id: snowflake().primaryKey(),
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
