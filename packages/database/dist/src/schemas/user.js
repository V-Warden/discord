"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zUserSelectSchema = exports.zUserUpdateSchema = exports.zUserCreate = exports.zUserMutable = exports.zUserRequired = exports.zUserSchema = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const custom_types_1 = require("./custom-types");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, custom_types_1.snowflake)().primaryKey(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", {
        mode: "date",
        precision: 3,
    }).$onUpdate(() => new Date()),
});
exports.zUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users)
    .extend({
    id: zod_1.z.string(),
})
    .required();
exports.zUserRequired = exports.zUserSchema.pick({
    id: true,
});
exports.zUserMutable = exports.zUserSchema
    .omit({
    id: true,
})
    .deepPartial();
exports.zUserCreate = exports.zUserMutable.extend(exports.zUserRequired.shape);
exports.zUserUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.users).extend({});
exports.zUserSelectSchema = (0, drizzle_zod_1.createSelectSchema)(exports.users).extend({});
//# sourceMappingURL=user.js.map