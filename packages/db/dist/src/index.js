"use strict";
exports.__esModule = true;
exports.db = void 0;
require("dotenv/config");
var node_postgres_1 = require("drizzle-orm/node-postgres");
exports.db = (0, node_postgres_1.drizzle)({
	connection: {
		connectionString: process.env.DATABASE_URL,
		ssl: true,
	},
});
