import { and, eq } from "drizzle-orm/pg-core/expressions";

import { db } from "../database";
import {
	type RoleArchiveInsert,
	type RoleArchiveUpdate,
	rolesArchive,
	zRoleArchiveCreate,
	zRoleArchiveMutable,
} from "../schemas/roles";

/**
 * Find a users roles in the archive by their ID and guild ID
 * @param userId - The ID of the user to find roles for
 * @param guildId - The ID of the guild to find roles for
 * @returns The role archive object
 */
export async function findRoleArchiveById(userId: string, guildId: string) {
	return db.query.rolesArchive.findFirst({
		where: and(
			eq(rolesArchive.userId, userId),
			eq(rolesArchive.guildId, guildId),
		),
	});
}

/**
 * Create a note
 * @param input - The note data to create
 * @returns The created note
 */
export async function createRoleArchive(input: RoleArchiveInsert) {
	const [inserted] = await db
		.insert(rolesArchive)
		.values(zRoleArchiveCreate.parse(input))
		.returning();

	if (!inserted?.userId) {
		throw new Error(`Failed to create role archive for user ${input.userId}`);
	}

	return inserted;
}

/**
 * Update a note
 * @param id - The ID of the note to update
 * @param input - The note data to update
 */
export async function updateRoleArchive(
	userId: string,
	guildId: string,
	input: RoleArchiveUpdate,
) {
	await db
		.update(rolesArchive)
		.set(zRoleArchiveMutable.parse(input))
		.where(
			and(eq(rolesArchive.userId, userId), eq(rolesArchive.guildId, guildId)),
		);
}

/**
 * Delete a role archive
 * @param userId - The ID of the user to delete the role archive for
 * @param guildId - The ID of the guild to delete the role archive for
 */
export async function deleteRoleArchive(userId: string, guildId: string) {
	await db
		.delete(rolesArchive)
		.where(
			and(eq(rolesArchive.userId, userId), eq(rolesArchive.guildId, guildId)),
		);
}
