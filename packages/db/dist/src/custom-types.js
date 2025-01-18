"use strict";
exports.__esModule = true;
exports.snowflake = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
exports.snowflake = (0, pg_core_1.customType)({
	dataType: function () {
		return "bigint";
	},
	// @ts-ignore
	fromDriver: function (value) {
		return value.toString();
	},
});
