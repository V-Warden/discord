import { relations } from "drizzle-orm";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { auditColumns, updatedAndCreatedAt } from "./common-columns.js";
import { snowflake } from "./custom-types.js";
import { users } from "./users.js";

/**
 * Database Schema Definition
 * Defines the structure of the 'notes' table in PostgreSQL
 */

export const notes = pgTable("notes", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),

	userId: snowflake("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" }),
	note: text().notNull(),

	// Audit Columns
	...updatedAndCreatedAt,
	...auditColumns,
});

/**
 * Relations
 * Relations for the notes table
 */

export const notesRelations = relations(notes, ({ one }) => ({
	user: one(users, {
		fields: [notes.userId],
		references: [users.id],
	}),
}));

/**
 * Zod Schema Definitions
 * Type validation schemas for note operations
 */

export const zNoteSchema = createInsertSchema(notes)
	.extend({
		user_id: z.string(),
	})
	.required();

export const zNoteRequired = zNoteSchema.pick({
	userId: true,
	note: true,
});

export const zNoteMutable = zNoteSchema
	.omit({
		user_id: true,
	})
	.deepPartial();

export const zNoteCreate = zNoteMutable.extend(zNoteRequired.shape).extend({
	createdBy: z.string(),
});

export const zNoteUpdateSchema = createUpdateSchema(notes).extend({
	updatedBy: z.string(),
});
export const zNoteSelectSchema = createSelectSchema(notes).extend({});

export type NoteInsert = z.infer<typeof zNoteCreate>;
export type NoteUpdate = z.infer<typeof zNoteUpdateSchema>;
export type NoteSelect = z.infer<typeof zNoteSelectSchema>;
