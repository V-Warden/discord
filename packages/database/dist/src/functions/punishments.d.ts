import { type PunishmentInsert, type PunishmentUpdate } from "../schemas/punishments.js";
/**
 * Find punishment settings by guild id
 * @param guildId - The ID of the guild
 * @returns The punishment object
 */
export declare function findPunishmentById(guildId: string): Promise<{
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    guildId: string | null;
    enabled: boolean | null;
    roleId: string | null;
    unban: {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    };
    owner: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    supporter: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    leaker: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    cheater: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    other: "BAN" | "KICK" | "WARN" | "ROLE" | null;
} | null>;
/**
 * Create a punishment
 * @param input - The punishment data to create
 * @returns The created punishment
 */
export declare function createPunishment(input: PunishmentInsert): Promise<{
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    guildId: string | null;
    enabled: boolean | null;
    roleId: string | null;
    unban: {
        enabled: boolean;
        owner: boolean;
        supporter: boolean;
        leaker: boolean;
        cheater: boolean;
        other: boolean;
    };
    owner: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    supporter: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    leaker: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    cheater: "BAN" | "KICK" | "WARN" | "ROLE" | null;
    other: "BAN" | "KICK" | "WARN" | "ROLE" | null;
}>;
/**
 * Update a punishment
 * @param guildId - The ID of the guild
 * @param input - The punishment data to update
 */
export declare function updatePunishment(guildId: string, input: PunishmentUpdate): Promise<void>;
/**
 * Delete a punishment
 * @param guildId - The ID of the guild
 */
export declare function deletePunishment(guildId: string): Promise<void>;
//# sourceMappingURL=punishments.d.ts.map