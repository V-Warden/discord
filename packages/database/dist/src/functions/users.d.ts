import { type UserInsert, type UserUpdate } from "../schemas/users.js";
/**
 * User Functions
 * Functions for user operations
 */
/**
 * Find a user by their ID
 * @param id - The ID of the user to find
 * @returns The user object
 */
export declare function findUserById(id: string): Promise<{
    id: string;
    last_username: string;
    appeals: number;
    first_appeal: Date | null;
    last_appeal: Date | null;
    status: "APPEALED" | "BLACKLISTED" | "PERM_BLACKLISTED" | "WHITELISTED";
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT";
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
} | undefined>;
/**
 * Create a user
 * @param input - The user data to create
 * @returns The created user
 */
export declare function createUser(input: UserInsert): Promise<{
    id: string;
    last_username: string;
    appeals: number;
    first_appeal: Date | null;
    last_appeal: Date | null;
    status: "APPEALED" | "BLACKLISTED" | "PERM_BLACKLISTED" | "WHITELISTED";
    type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT";
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
/**
 * Update a user
 * @param id - The ID of the user to update
 * @param input - The user data to update
 */
export declare function updateUser(id: string, input: UserUpdate): Promise<void>;
/**
 * Delete a user
 * @param id - The ID of the user to delete
 */
export declare function deleteUser(id: string): Promise<void>;
//# sourceMappingURL=users.d.ts.map