"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.dbSchema = void 0;
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const user_1 = require("./schemas/user");
const getEnvVariable = (name) => {
    const value = process.env[name];
    if (value == null)
        throw new Error(`environment variable ${name} not found`);
    return value;
};
exports.dbSchema = {
    users: user_1.users,
};
exports.db = (0, node_postgres_1.drizzle)({
    connection: {
        connectionString: getEnvVariable("DATABASE_URL"),
    },
    schema: exports.dbSchema,
});
//# sourceMappingURL=database.js.map