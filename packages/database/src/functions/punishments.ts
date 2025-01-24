import { eq } from "drizzle-orm/pg-core/expressions";

import { db } from "../database.js";
import {
	type PunishmentInsert,
	type PunishmentUpdate,
	punishments,
	zPunishmentCreate,
	zPunishmentSelectSchema,
	zPunishmentUpdateSchema,
} from "../schemas/punishments.js";

/**
 * Find punishment settings by guild id
 * @param guildId - The ID of the guild
 * @returns The punishment object
 */
export async function findPunishmentById(guildId: string) {
	const punishment = await db.query.punishments.findFirst({
		where: eq(punishments.guildId, guildId),
	});

	if (!punishment) return null;

	return zPunishmentSelectSchema.parse(punishment);
}

/**
 * Create a punishment
 * @param input - The punishment data to create
 * @returns The created punishment
 */
export async function createPunishment(input: PunishmentInsert) {
	await db.insert(punishments).values(zPunishmentCreate.parse(input));

	const created = await findPunishmentById(input.guildId);
	if (!created)
		throw new Error(`Failed to create Punishment with id ${input.guildId}`);

	return zPunishmentSelectSchema.parse(created);
}

/**
 * Update a punishment
 * @param guildId - The ID of the guild
 * @param input - The punishment data to update
 */
export async function updatePunishment(
	guildId: string,
	input: PunishmentUpdate,
) {
	await db
		.update(punishments)
		.set(zPunishmentUpdateSchema.parse(input))
		.where(eq(punishments.guildId, guildId));
}

/**
 * Delete a punishment
 * @param guildId - The ID of the guild
 */
export async function deletePunishment(guildId: string) {
	await db.delete(punishments).where(eq(punishments.guildId, guildId));
}
