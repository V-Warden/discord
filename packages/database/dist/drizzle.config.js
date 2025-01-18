"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const drizzle_kit_1 = require("drizzle-kit");
exports.default = (0, drizzle_kit_1.defineConfig)({
    schema: "./src/schemas",
    dialect: "postgresql",
    out: "./migrations",
    dbCredentials: {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        url: process.env.DATABASE_URL,
    },
});
//# sourceMappingURL=drizzle.config.js.map