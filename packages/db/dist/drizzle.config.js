"use strict";
exports.__esModule = true;
require("dotenv/config");
var drizzle_kit_1 = require("drizzle-kit");
exports["default"] = (0, drizzle_kit_1.defineConfig)({
	out: "./drizzle",
	schema: "./src/schemas",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
});
