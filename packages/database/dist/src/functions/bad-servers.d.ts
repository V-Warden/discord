import { type BadServerInsert, type BadServerUpdate } from "../schemas/bad-servers.js";
/**
 *
 * @param limit - The number of bad servers to find
 * @param offset - The number of bad servers to skip
 * @returns The bad servers object
 */
export declare function getBadServers(limit: number, offset: number): Promise<{
    count: number;
    badServers: {
        id: string;
        name: string;
        type: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING";
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        oldNames: string[] | null;
        invite: string | null;
        reason: string | null;
    }[];
}>;
/**
 * Find a user by their ID
 * @param id - The ID of the user to find
 * @returns The user object
 */
export declare function findBadServerById(id: string): Promise<{
    id: string;
    name: string;
    type: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING";
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    oldNames: string[] | null;
    invite: string | null;
    reason: string | null;
} | undefined>;
/**
 * Create a user
 * @param input - The user data to create
 * @returns The created user
 */
export declare function createBadServer(input: BadServerInsert): Promise<{
    id: string;
    name: string;
    type: "OTHER" | "CHEATING" | "LEAKING" | "RESELLING" | "ADVERTISING";
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    oldNames: string[] | null;
    invite: string | null;
    reason: string | null;
}>;
/**
 * Update a user
 * @param id - The ID of the user to update
 * @param input - The user data to update
 */
export declare function updateBadServer(id: string, input: BadServerUpdate): Promise<void>;
/**
 * Delete a user
 * @param id - The ID of the user to delete
 */
export declare function deleteBadServer(id: string): Promise<void>;
//# sourceMappingURL=bad-servers.d.ts.map