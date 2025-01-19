import { eq } from "drizzle-orm/pg-core/expressions";
import type { z } from "zod";

import { db } from "../index.js";
import type { UserType } from "../schemas/custom-types.js";
import { users, zUserCreate, zUserUpdateSchema } from "../schemas/users.js";

/**
 * User Functions
 * Functions for user operations
 */

/**
 * Find a user by their ID
 * @param id - The ID of the user to find
 * @returns The user object
 */
export async function findUserById(id: string) {
	return db.query.users.findFirst({
		where: eq(users.id, id),
	});
}

/**
 * Create a user
 * @param input - The user data to create
 * @returns The created user
 */
export async function createUser(
	input: z.infer<typeof zUserCreate> & {
		id: string;
		last_username: string;
		type: UserType;
	},
) {
	await db.insert(users).values(zUserCreate.parse(input));

	const created = await findUserById(input.id);
	if (!created) throw new Error(`Failed to create User with id ${input.id}`);

	return created;
}

/**
 * Update a user
 * @param id - The ID of the user to update
 * @param input - The user data to update
 */
export async function updateUser(
	id: string,
	input: z.infer<typeof zUserUpdateSchema>,
) {
	await db
		.update(users)
		.set(zUserUpdateSchema.parse(input))
		.where(eq(users.id, id));
}

/**
 * Delete a user
 * @param id - The ID of the user to delete
 */
export async function deleteUser(id: string) {
	await db.delete(users).where(eq(users.id, id));
}
