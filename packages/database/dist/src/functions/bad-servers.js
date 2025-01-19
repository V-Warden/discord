"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findBadServerById = findBadServerById;
exports.createBadServer = createBadServer;
exports.updateBadServer = updateBadServer;
exports.deleteBadServer = deleteBadServer;
const expressions_1 = require("drizzle-orm/pg-core/expressions");
const index_js_1 = require("../index.js");
const bad_servers_js_1 = require("../schemas/bad-servers.js");
/**
 * User Functions
 * Functions for user operations
 */
/**
 * Find a user by their ID
 * @param id - The ID of the user to find
 * @returns The user object
 */
async function findBadServerById(id) {
    return index_js_1.db.query.badServers.findFirst({
        where: (0, expressions_1.eq)(bad_servers_js_1.badServers.id, id),
    });
}
/**
 * Create a user
 * @param input - The user data to create
 * @returns The created user
 */
async function createBadServer(input) {
    await index_js_1.db.insert(bad_servers_js_1.badServers).values(bad_servers_js_1.zBadServerCreate.parse(input));
    const created = await findBadServerById(input.id);
    if (!created)
        throw new Error(`Failed to create BadServer with id ${input.id}`);
    return created;
}
/**
 * Update a user
 * @param id - The ID of the user to update
 * @param input - The user data to update
 */
async function updateBadServer(id, input) {
    await index_js_1.db
        .update(bad_servers_js_1.badServers)
        .set(bad_servers_js_1.zBadServerUpdateSchema.parse(input))
        .where((0, expressions_1.eq)(bad_servers_js_1.badServers.id, id));
}
/**
 * Delete a user
 * @param id - The ID of the user to delete
 */
async function deleteBadServer(id) {
    await index_js_1.db.delete(bad_servers_js_1.badServers).where((0, expressions_1.eq)(bad_servers_js_1.badServers.id, id));
}
//# sourceMappingURL=bad-servers.js.map