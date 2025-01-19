import { and, eq } from "drizzle-orm/pg-core/expressions";

import { db } from "../index.js";
import {
	type ImportInsert,
	type ImportUpdate,
	imports,
	zImportCreate,
	zImportUpdateSchema,
} from "../schemas/imports.js";

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
export async function findImportByUserAndServerId(
	userId: string,
	serverId: string,
) {
	return db.query.imports.findFirst({
		where: and(eq(imports.id, userId), eq(imports.server, serverId)),
	});
}

/**
 * Create an import
 * @param input - The import data to create
 * @returns The created import
 */
export async function createImport(input: ImportInsert) {
	await db.insert(imports).values(zImportCreate.parse(input));

	const created = await findImportByUserAndServerId(input.id, input.server);
	if (!created) throw new Error(`Failed to create Import with id ${input.id}`);

	return created;
}

/**
 * Update an import
 * @param userId - The ID of the user
 * @param serverId - The ID of the server
 * @param input - The import data to update
 */
export async function updateImport(
	userId: string,
	serverId: string,
	input: ImportUpdate,
) {
	await db
		.update(imports)
		.set(zImportUpdateSchema.parse(input))
		.where(and(eq(imports.id, userId), eq(imports.server, serverId)));
}

/**
 * Delete an import
 * @param userId - The ID of the user
 * @param serverId - The ID of the server
 */
export async function deleteImport(userId: string, serverId: string) {
	await db
		.delete(imports)
		.where(and(eq(imports.id, userId), eq(imports.server, serverId)));
}
