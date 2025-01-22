import { eq } from "drizzle-orm/pg-core/expressions";

import { db } from "../index.js";
import {
	type NoteInsert,
	type NoteUpdate,
	notes,
	zNoteCreate,
	zNoteUpdateSchema,
} from "../schemas/notes.js";

/**
 * Find a note by its ID
 * @param id - The ID of the note to find
 * @returns The note object
 */
export async function findNoteById(id: number) {
	return db.query.notes.findFirst({
		where: eq(notes.id, id),
	});
}

/**
 * Find notes by user ID
 * @param userId - The ID of the user to find notes for
 * @returns The notes for the user
 */
export async function findNotesByUserId(userId: string) {
	return db.query.notes.findMany({
		where: eq(notes.userId, userId),
	});
}

/**
 * Create a note
 * @param input - The note data to create
 * @returns The created note
 */
export async function createNote(input: NoteInsert) {
	const [inserted] = await db
		.insert(notes)
		.values(zNoteCreate.parse(input))
		.returning();

	if (!inserted?.id) {
		throw new Error(`Failed to create note for user ${input.userId}`);
	}

	return inserted;
}

/**
 * Update a note
 * @param id - The ID of the note to update
 * @param input - The note data to update
 */
export async function updateNote(id: number, input: NoteUpdate) {
	await db
		.update(notes)
		.set(zNoteUpdateSchema.parse(input))
		.where(eq(notes.id, id));
}

/**
 * Delete a note
 * @param id - The ID of the note to delete
 */
export async function deleteNote(id: number) {
	await db.delete(notes).where(eq(notes.id, id));
}
