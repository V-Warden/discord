import { type NoteInsert, type NoteUpdate } from "../schemas/notes.js";
/**
 * Find a note by its ID
 * @param id - The ID of the note to find
 * @returns The note object
 */
export declare function findNoteById(id: number): Promise<{
    id: number;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: string;
    note: string;
} | undefined>;
/**
 * Find notes by user ID
 * @param userId - The ID of the user to find notes for
 * @returns The notes for the user
 */
export declare function findNotesByUserId(userId: string): Promise<{
    id: number;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: string;
    note: string;
}[]>;
/**
 * Create a note
 * @param input - The note data to create
 * @returns The created note
 */
export declare function createNote(input: NoteInsert): Promise<{
    id: number;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: string;
    note: string;
}>;
/**
 * Update a note
 * @param id - The ID of the note to update
 * @param input - The note data to update
 */
export declare function updateNote(id: number, input: NoteUpdate): Promise<void>;
/**
 * Delete a note
 * @param id - The ID of the note to delete
 */
export declare function deleteNote(id: number): Promise<void>;
//# sourceMappingURL=notes.d.ts.map