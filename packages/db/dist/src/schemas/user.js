"use strict";
exports.__esModule = true;
exports.zUserSelectSchema =
	exports.zUserUpdateSchema =
	exports.zUserRequired =
	exports.zUserSchema =
	exports.users =
		void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
var zod_1 = require("zod");
var custom_types_js_1 = require("../custom-types.js");
exports.users = (0, pg_core_1.pgTable)("users", {
	id: (0, custom_types_js_1.snowflake)().primaryKey(),
	createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
	updatedAt: (0, pg_core_1.timestamp)("updated_at", {
		mode: "date",
		precision: 3,
	}).$onUpdate(function () {
		return new Date();
	}),
});
exports.zUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users)
	.extend({
		id: zod_1.z.string(),
	})
	.required();
exports.zUserRequired = exports.zUserSchema.pick({
	id: true,
});
exports.zUserUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(
	exports.users,
).extend({});
exports.zUserSelectSchema = (0, drizzle_zod_1.createSelectSchema)(
	exports.users,
).extend({});
