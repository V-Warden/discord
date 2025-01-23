"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findGuildById = findGuildById;
exports.createGuild = createGuild;
exports.updateGuild = updateGuild;
exports.deleteGuild = deleteGuild;
const expressions_1 = require("drizzle-orm/pg-core/expressions");
const index_js_1 = require("../index.js");
const guilds_js_1 = require("../schemas/guilds.js");
const punishments_js_1 = require("../schemas/punishments.js");
/**
 * Find a guild by the ID
 * @param id - The ID of the guild
 * @returns The guild object
 */
async function findGuildById(id) {
    return index_js_1.db.query.guilds.findFirst({
        where: (0, expressions_1.eq)(guilds_js_1.guilds.id, id),
    });
}
/**
 * Create a guild
 * @param input - The guild data to create
 * @returns The created guild
 */
async function createGuild(input) {
    console.log(input);
    await index_js_1.db.insert(guilds_js_1.guilds).values(guilds_js_1.zGuildCreate.parse(input));
    await index_js_1.db.insert(punishments_js_1.punishments).values(punishments_js_1.zPunishmentCreate.parse({
        id: input.id,
    }));
    const created = await findGuildById(input.id);
    if (!created)
        throw new Error(`Failed to create Guild with id ${input.id}`);
    return created;
}
/**
 * Update a guild
 * @param id - The ID of the guild
 * @param input - The guild data to update
 */
async function updateGuild(id, input) {
    await index_js_1.db
        .update(guilds_js_1.guilds)
        .set(guilds_js_1.zGuildUpdateSchema.parse(input))
        .where((0, expressions_1.eq)(guilds_js_1.guilds.id, id));
}
/**
 * Delete a guild
 * @param id - The ID of the guild
 */
async function deleteGuild(id) {
    await index_js_1.db.delete(guilds_js_1.guilds).where((0, expressions_1.eq)(guilds_js_1.guilds.id, id));
}
//# sourceMappingURL=guilds.js.map