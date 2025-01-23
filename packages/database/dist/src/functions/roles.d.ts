import { type RoleArchiveInsert, type RoleArchiveUpdate } from "../schemas/roles.js";
/**
 * Find a users roles in the archive by their ID and guild ID
 * @param userId - The ID of the user to find roles for
 * @param guildId - The ID of the guild to find roles for
 * @returns The role archive object
 */
export declare function findRoleArchiveById(userId: string, guildId: string): Promise<{
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: string | null;
    roles: string[] | null;
    guildId: string | null;
} | undefined>;
/**
 * Create a note
 * @param input - The note data to create
 * @returns The created note
 */
export declare function createRoleArchive(input: RoleArchiveInsert): Promise<{
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: string | null;
    roles: string[] | null;
    guildId: string | null;
}>;
/**
 * Update a note
 * @param id - The ID of the note to update
 * @param input - The note data to update
 */
export declare function updateRoleArchive(userId: string, guildId: string, input: RoleArchiveUpdate): Promise<void>;
/**
 * Delete a role archive
 * @param userId - The ID of the user to delete the role archive for
 * @param guildId - The ID of the guild to delete the role archive for
 */
export declare function deleteRoleArchive(userId: string, guildId: string): Promise<void>;
//# sourceMappingURL=roles.d.ts.map