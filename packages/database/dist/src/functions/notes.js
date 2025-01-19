"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNoteById = findNoteById;
exports.findNotesByUserId = findNotesByUserId;
exports.createNote = createNote;
exports.updateNote = updateNote;
exports.deleteNote = deleteNote;
const expressions_1 = require("drizzle-orm/pg-core/expressions");
const index_js_1 = require("../index.js");
const notes_js_1 = require("../schemas/notes.js");
/**
 * Note Functions
 * Functions for note operations
 */
/**
 * Find a note by its ID
 * @param id - The ID of the note to find
 * @returns The note object
 */
async function findNoteById(id) {
    return index_js_1.db.query.notes.findFirst({
        where: (0, expressions_1.eq)(notes_js_1.notes.id, id),
    });
}
/**
 * Find notes by user ID
 * @param userId - The ID of the user to find notes for
 * @returns The notes for the user
 */
async function findNotesByUserId(userId) {
    return index_js_1.db.query.notes.findMany({
        where: (0, expressions_1.eq)(notes_js_1.notes.userId, userId),
    });
}
/**
 * Create a note
 * @param input - The note data to create
 * @returns The created note
 */
async function createNote(input) {
    const [inserted] = await index_js_1.db
        .insert(notes_js_1.notes)
        .values(notes_js_1.zNoteCreate.parse(input))
        .returning({ id: notes_js_1.notes.id });
    if (!inserted?.id) {
        throw new Error(`Failed to create note for user ${input.userId}`);
    }
    const created = await findNoteById(inserted.id);
    if (!created) {
        throw new Error(`Failed to find created note with id ${inserted.id}`);
    }
    return created;
}
/**
 * Update a note
 * @param id - The ID of the note to update
 * @param input - The note data to update
 */
async function updateNote(id, input) {
    await index_js_1.db
        .update(notes_js_1.notes)
        .set(notes_js_1.zNoteUpdateSchema.parse(input))
        .where((0, expressions_1.eq)(notes_js_1.notes.id, id));
}
/**
 * Delete a note
 * @param id - The ID of the note to delete
 */
async function deleteNote(id) {
    await index_js_1.db.delete(notes_js_1.notes).where((0, expressions_1.eq)(notes_js_1.notes.id, id));
}
//# sourceMappingURL=notes.js.map