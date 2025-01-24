"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBadServers = getBadServers;
exports.findBadServerById = findBadServerById;
exports.createBadServer = createBadServer;
exports.updateBadServer = updateBadServer;
exports.deleteBadServer = deleteBadServer;
const expressions_1 = require("drizzle-orm/pg-core/expressions");
const index_js_1 = require("../index.js");
const bad_servers_js_1 = require("../schemas/bad-servers.js");
/**
 *
 * @param limit - The number of bad servers to find
 * @param offset - The number of bad servers to skip
 * @returns The bad servers object
 */
async function getBadServers(limit, offset) {
    const result = await index_js_1.db.transaction(async (tx) => {
        const countResult = await tx.execute('SELECT COUNT(*) FROM bad_servers');
        const count = countResult.rows[0] ? Number.parseInt(String(countResult.rows[0].count), 10) : 0;
        const badServers = await tx.query.badServers.findMany({
            limit: limit,
            offset: offset,
        });
        return { count, badServers };
    });
    return result;
}
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