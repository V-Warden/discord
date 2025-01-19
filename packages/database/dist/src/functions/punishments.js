"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPunishmentById = findPunishmentById;
exports.createPunishment = createPunishment;
exports.updatePunishment = updatePunishment;
exports.deletePunishment = deletePunishment;
const expressions_1 = require("drizzle-orm/pg-core/expressions");
const index_js_1 = require("../index.js");
const punishments_js_1 = require("../schemas/punishments.js");
/**
 * Punishment Functions
 * Functions for punishment operations
 */
/**
 * Find punishment settings by guild id
 * @param guildId - The ID of the guild
 * @returns The punishment object
 */
async function findPunishmentById(guildId) {
    const punishment = await index_js_1.db.query.punishments.findFirst({
        where: (0, expressions_1.eq)(punishments_js_1.punishments.id, guildId),
    });
    if (!punishment)
        return null;
    return punishments_js_1.zPunishmentSelectSchema.parse(punishment);
}
/**
 * Create a punishment
 * @param input - The punishment data to create
 * @returns The created punishment
 */
async function createPunishment(input) {
    await index_js_1.db.insert(punishments_js_1.punishments).values(punishments_js_1.zPunishmentCreate.parse(input));
    const created = await findPunishmentById(input.id);
    if (!created)
        throw new Error(`Failed to create Punishment with id ${input.id}`);
    return punishments_js_1.zPunishmentSelectSchema.parse(created);
}
/**
 * Update a punishment
 * @param guildId - The ID of the guild
 * @param input - The punishment data to update
 */
async function updatePunishment(guildId, input) {
    await index_js_1.db
        .update(punishments_js_1.punishments)
        .set(punishments_js_1.zPunishmentUpdateSchema.parse(input))
        .where((0, expressions_1.eq)(punishments_js_1.punishments.id, guildId));
}
/**
 * Delete a punishment
 * @param guildId - The ID of the guild
 */
async function deletePunishment(guildId) {
    await index_js_1.db.delete(punishments_js_1.punishments).where((0, expressions_1.eq)(punishments_js_1.punishments.id, guildId));
}
//# sourceMappingURL=punishments.js.map