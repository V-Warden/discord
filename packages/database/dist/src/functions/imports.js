"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findImportByUserAndServerId = findImportByUserAndServerId;
exports.createImport = createImport;
exports.updateImport = updateImport;
exports.deleteImport = deleteImport;
const expressions_1 = require("drizzle-orm/pg-core/expressions");
const index_js_1 = require("../index.js");
const imports_js_1 = require("../schemas/imports.js");
/**
 * Import Functions
 * Functions for import operations
 */
/**
 * Find an import by the user and server id
 * @param userId - The ID of the user
 * @param serverId - The ID of the server
 * @returns The import object
 */
async function findImportByUserAndServerId(userId, serverId) {
    return index_js_1.db.query.imports.findFirst({
        where: (0, expressions_1.and)((0, expressions_1.eq)(imports_js_1.imports.id, userId), (0, expressions_1.eq)(imports_js_1.imports.server, serverId)),
    });
}
/**
 * Create an import
 * @param input - The import data to create
 * @returns The created import
 */
async function createImport(input) {
    await index_js_1.db.insert(imports_js_1.imports).values(imports_js_1.zImportCreate.parse(input));
    const created = await findImportByUserAndServerId(input.id, input.server);
    if (!created)
        throw new Error(`Failed to create Import with id ${input.id}`);
    return created;
}
/**
 * Update an import
 * @param userId - The ID of the user
 * @param serverId - The ID of the server
 * @param input - The import data to update
 */
async function updateImport(userId, serverId, input) {
    await index_js_1.db
        .update(imports_js_1.imports)
        .set(imports_js_1.zImportUpdateSchema.parse(input))
        .where((0, expressions_1.and)((0, expressions_1.eq)(imports_js_1.imports.id, userId), (0, expressions_1.eq)(imports_js_1.imports.server, serverId)));
}
/**
 * Delete an import
 * @param userId - The ID of the user
 * @param serverId - The ID of the server
 */
async function deleteImport(userId, serverId) {
    await index_js_1.db
        .delete(imports_js_1.imports)
        .where((0, expressions_1.and)((0, expressions_1.eq)(imports_js_1.imports.id, userId), (0, expressions_1.eq)(imports_js_1.imports.server, serverId)));
}
//# sourceMappingURL=imports.js.map