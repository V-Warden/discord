import { type GuildInsert, type GuildUpdate } from "../schemas/guilds.js";
/**
 * Find a guild by the ID
 * @param id - The ID of the guild
 * @returns The guild object
 */
export declare function findGuildById(id: string): Promise<{
    id: string | null;
    name: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    logChannelId: string | null;
} | undefined>;
/**
 * Create a guild
 * @param input - The guild data to create
 * @returns The created guild
 */
export declare function createGuild(input: GuildInsert): Promise<{
    id: string | null;
    name: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    logChannelId: string | null;
}>;
/**
 * Update a guild
 * @param id - The ID of the guild
 * @param input - The guild data to update
 */
export declare function updateGuild(id: string, input: GuildUpdate): Promise<void>;
/**
 * Delete a guild
 * @param id - The ID of the guild
 */
export declare function deleteGuild(id: string): Promise<void>;
//# sourceMappingURL=guilds.d.ts.map