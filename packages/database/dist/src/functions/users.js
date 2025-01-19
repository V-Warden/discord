"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserById = findUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const expressions_1 = require("drizzle-orm/pg-core/expressions");
const index_js_1 = require("../index.js");
const users_js_1 = require("../schemas/users.js");
/**
 * User Functions
 * Functions for user operations
 */
/**
 * Find a user by their ID
 * @param id - The ID of the user to find
 * @returns The user object
 */
async function findUserById(id) {
    return index_js_1.db.query.users.findFirst({
        where: (0, expressions_1.eq)(users_js_1.users.id, id),
    });
}
/**
 * Create a user
 * @param input - The user data to create
 * @returns The created user
 */
async function createUser(input) {
    await index_js_1.db.insert(users_js_1.users).values(users_js_1.zUserCreate.parse(input));
    const created = await findUserById(input.id);
    if (!created)
        throw new Error(`Failed to create User with id ${input.id}`);
    return created;
}
/**
 * Update a user
 * @param id - The ID of the user to update
 * @param input - The user data to update
 */
async function updateUser(id, input) {
    await index_js_1.db
        .update(users_js_1.users)
        .set(users_js_1.zUserUpdateSchema.parse(input))
        .where((0, expressions_1.eq)(users_js_1.users.id, id));
}
/**
 * Delete a user
 * @param id - The ID of the user to delete
 */
async function deleteUser(id) {
    await index_js_1.db.delete(users_js_1.users).where((0, expressions_1.eq)(users_js_1.users.id, id));
}
//# sourceMappingURL=users.js.map