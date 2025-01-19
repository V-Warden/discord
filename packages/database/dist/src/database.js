"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.dbSchema = void 0;
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const bad_servers_1 = require("./schemas/bad-servers");
const guilds_1 = require("./schemas/guilds");
const imports_1 = require("./schemas/imports");
const notes_1 = require("./schemas/notes");
const punishments_1 = require("./schemas/punishments");
const users_1 = require("./schemas/users");
const getEnvVariable = (name) => {
    const value = process.env[name];
    if (value == null)
        throw new Error(`environment variable ${name} not found`);
    return value;
};
exports.dbSchema = {
    users: users_1.users,
    notes: notes_1.notes,
    badServers: bad_servers_1.badServers,
    imports: imports_1.imports,
    guilds: guilds_1.guilds,
    punishments: punishments_1.punishments,
};
console.log(getEnvVariable("DATABASE_URL"));
exports.db = (0, node_postgres_1.drizzle)({
    connection: {
        connectionString: getEnvVariable("DATABASE_URL"),
    },
    schema: exports.dbSchema,
});
//# sourceMappingURL=database.js.map