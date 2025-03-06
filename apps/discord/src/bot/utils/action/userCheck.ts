import {
	findAllImportsByUserIdNotAppealed,
	findUserById,
} from "@warden/database";

/**
 * Return user and imports information.
 * @param id - The user id to check.
 * @returns The user and imports information.
 */
const userCheck = async (id: string) => {
	const user = await findUserById(id);
	if (!user) {
		return false;
	}

	const imports = await findAllImportsByUserIdNotAppealed(id);
	if (imports.length === 0) {
		// TODO: Implement the appeal user feature here
		return false;
	}

	return { user, imports };
};

export default userCheck;
