import { type ImportInsert, type ImportUpdate } from "../schemas/imports.js";
/**
 * Import Functions
 * Functions for import operations
 */
/**
 * Find an import by the user and server id
 * @param userId - The ID of the user
 * @param serverId - The ID of the server
 * @returns The import object
 */
export declare function findImportByUserAndServerId(userId: string, serverId: string): Promise<{
    id: string | null;
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    server: string | null;
    roles: string[] | null;
    appealed: boolean | null;
} | undefined>;
/**
 * Create an import
 * @param input - The import data to create
 * @returns The created import
 */
export declare function createImport(input: ImportInsert): Promise<{
    id: string | null;
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT" | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    server: string | null;
    roles: string[] | null;
    appealed: boolean | null;
}>;
/**
 * Update an import
 * @param userId - The ID of the user
 * @param serverId - The ID of the server
 * @param input - The import data to update
 */
export declare function updateImport(userId: string, serverId: string, input: ImportUpdate): Promise<void>;
/**
 * Delete an import
 * @param userId - The ID of the user
 * @param serverId - The ID of the server
 */
export declare function deleteImport(userId: string, serverId: string): Promise<void>;
//# sourceMappingURL=imports.d.ts.map