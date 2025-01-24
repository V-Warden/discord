import { eq } from "drizzle-orm/pg-core/expressions"

import { db } from "../index.js"
import {
	type BadServerInsert,
	type BadServerUpdate,
	badServers,
	zBadServerCreate,
	zBadServerUpdateSchema,
} from "../schemas/bad-servers.js"

/**
 * 
 * @param limit - The number of bad servers to find
 * @param offset - The number of bad servers to skip
 * @returns The bad servers object
 */
export async function getBadServers(limit: number, offset: number) {
	const result = await db.transaction(async (tx) => {
		const countResult = await tx.execute('SELECT COUNT(*) FROM bad_servers')
		const count = countResult.rows[0] ? Number.parseInt(String(countResult.rows[0].count), 10) : 0

		const badServers = await tx.query.badServers.findMany({
			limit: limit,
			offset: offset,
		})

		return { count, badServers }
	})

	return result
}

/**
 * Find a user by their ID
 * @param id - The ID of the user to find
 * @returns The user object
 */
export async function findBadServerById(id: string) {
	return db.query.badServers.findFirst({
		where: eq(badServers.id, id),
	})
}

/**
 * Create a user
 * @param input - The user data to create
 * @returns The created user
 */
export async function createBadServer(input: BadServerInsert) {
	await db.insert(badServers).values(zBadServerCreate.parse(input))

	const created = await findBadServerById(input.id)
	if (!created)
		throw new Error(`Failed to create BadServer with id ${input.id}`)

	return created
}

/**
 * Update a user
 * @param id - The ID of the user to update
 * @param input - The user data to update
 */
export async function updateBadServer(id: string, input: BadServerUpdate) {
	await db
		.update(badServers)
		.set(zBadServerUpdateSchema.parse(input))
		.where(eq(badServers.id, id))
}

/**
 * Delete a user
 * @param id - The ID of the user to delete
 */
export async function deleteBadServer(id: string) {
	await db.delete(badServers).where(eq(badServers.id, id))
}
