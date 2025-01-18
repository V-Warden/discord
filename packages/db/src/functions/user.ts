import { eq } from "drizzle-orm/pg-core/expressions";
import { z } from "zod";
import { db } from "../index.js";
import {
	users,
	type UserUpdate,
	zUserRequired,
	zUserSchema,
	zUserUpdateSchema,
} from "../schemas/user.js";

export async function findUserById(id: string) {
	return db.query.users.findFirst({
		where: eq(users.id, id),
	});
}

export async function createUser(
	input: z.infer<typeof zUserRequired> & { id: string },
) {
	await db.insert(users).values(zUserSchema.parse(input));

	const created = await findUserById(input.id);
	if (!created) throw new Error(`Failed to create User with id ${input.id}`);

	return created;
}

export async function updateUser(id: string, input: UserUpdate) {
	await db
		.update(users)
		.set(zUserUpdateSchema.parse(input))
		.where(eq(users.id, id));
}

export async function deleteUser(id: string) {
	await db.delete(users).where(eq(users.id, id));
}
