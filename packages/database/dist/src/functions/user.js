"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserById = findUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const expressions_1 = require("drizzle-orm/pg-core/expressions");
const index_js_1 = require("../index.js");
const user_js_1 = require("../schemas/user.js");
async function findUserById(id) {
    return index_js_1.db.query.users.findFirst({
        where: (0, expressions_1.eq)(user_js_1.users.id, id),
    });
}
async function createUser(input) {
    await index_js_1.db.insert(user_js_1.users).values(user_js_1.zUserRequired.parse(input));
    const created = await findUserById(input.id);
    if (!created)
        throw new Error(`Failed to create User with id ${input.id}`);
    return created;
}
async function updateUser(id, input) {
    await index_js_1.db
        .update(user_js_1.users)
        .set(user_js_1.zUserUpdateSchema.parse(input))
        .where((0, expressions_1.eq)(user_js_1.users.id, id));
}
async function deleteUser(id) {
    await index_js_1.db.delete(user_js_1.users).where((0, expressions_1.eq)(user_js_1.users.id, id));
}
//# sourceMappingURL=user.js.map