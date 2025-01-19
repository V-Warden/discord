import { eq } from "drizzle-orm/pg-core/expressions";

import { db } from "../index.js";
import {
	type GuildInsert,
	type GuildUpdate,
	guilds,
	zGuildCreate,
	zGuildUpdateSchema,
} from "../schemas/guilds.js";
import { punishments, zPunishmentCreate } from "../schemas/punishments.js";

/**
 * Find a guild by the ID
 * @param id - The ID of the guild
 * @returns The guild object
 */
export async function findGuildById(id: string) {
	return db.query.guilds.findFirst({
		where: eq(guilds.id, id),
	});
}

/**
 * Create a guild
 * @param input - The guild data to create
 * @returns The created guild
 */
export async function createGuild(input: GuildInsert) {
	console.log(input);
	await db.insert(guilds).values(zGuildCreate.parse(input));
	await db.insert(punishments).values(
		zPunishmentCreate.parse({
			id: input.id,
		}),
	);

	const created = await findGuildById(input.id);
	if (!created) throw new Error(`Failed to create Guild with id ${input.id}`);

	return created;
}

/**
 * Update a guild
 * @param id - The ID of the guild
 * @param input - The guild data to update
 */
export async function updateGuild(id: string, input: GuildUpdate) {
	await db
		.update(guilds)
		.set(zGuildUpdateSchema.parse(input))
		.where(eq(guilds.id, id));
}

/**
 * Delete a guild
 * @param id - The ID of the guild
 */
export async function deleteGuild(id: string) {
	await db.delete(guilds).where(eq(guilds.id, id));
}
