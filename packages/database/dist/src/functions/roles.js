"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRoleArchiveById = findRoleArchiveById;
exports.createRoleArchive = createRoleArchive;
exports.updateRoleArchive = updateRoleArchive;
exports.deleteRoleArchive = deleteRoleArchive;
const expressions_1 = require("drizzle-orm/pg-core/expressions");
const index_js_1 = require("../index.js");
const roles_js_1 = require("../schemas/roles.js");
/**
 * Find a users roles in the archive by their ID and guild ID
 * @param userId - The ID of the user to find roles for
 * @param guildId - The ID of the guild to find roles for
 * @returns The role archive object
 */
async function findRoleArchiveById(userId, guildId) {
    return index_js_1.db.query.rolesArchive.findFirst({
        where: (0, expressions_1.and)((0, expressions_1.eq)(roles_js_1.rolesArchive.userId, userId), (0, expressions_1.eq)(roles_js_1.rolesArchive.guildId, guildId)),
    });
}
/**
 * Create a note
 * @param input - The note data to create
 * @returns The created note
 */
async function createRoleArchive(input) {
    const [inserted] = await index_js_1.db
        .insert(roles_js_1.rolesArchive)
        .values(roles_js_1.zRoleArchiveCreate.parse(input))
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
async function updateRoleArchive(userId, guildId, input) {
    await index_js_1.db
        .update(roles_js_1.rolesArchive)
        .set(roles_js_1.zRoleArchiveMutable.parse(input))
        .where((0, expressions_1.and)((0, expressions_1.eq)(roles_js_1.rolesArchive.userId, userId), (0, expressions_1.eq)(roles_js_1.rolesArchive.guildId, guildId)));
}
/**
 * Delete a role archive
 * @param userId - The ID of the user to delete the role archive for
 * @param guildId - The ID of the guild to delete the role archive for
 */
async function deleteRoleArchive(userId, guildId) {
    await index_js_1.db
        .delete(roles_js_1.rolesArchive)
        .where((0, expressions_1.and)((0, expressions_1.eq)(roles_js_1.rolesArchive.userId, userId), (0, expressions_1.eq)(roles_js_1.rolesArchive.guildId, guildId)));
}
//# sourceMappingURL=roles.js.map