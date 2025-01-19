"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.punishmentType = exports.serverType = exports.userType = exports.userStatus = exports.snowflake = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
/**
 * Custom Types
 * Custom types for the database
 */
exports.snowflake = (0, pg_core_1.customType)({
    dataType() {
        return "bigint";
    },
    // @ts-ignore
    fromDriver(value) {
        return value.toString();
    },
});
exports.userStatus = (0, pg_core_1.pgEnum)("user_status", [
    "APPEALED",
    "BLACKLISTED",
    "PERM_BLACKLISTED",
    "WHITELISTED",
]);
exports.userType = (0, pg_core_1.pgEnum)("user_type", [
    "OTHER",
    "LEAKER",
    "CHEATER",
    "SUPPORTER",
    "OWNER",
    "BOT",
]);
exports.serverType = (0, pg_core_1.pgEnum)("server_type", [
    "CHEATING",
    "LEAKING",
    "RESELLING",
    "ADVERTISING",
    "OTHER",
]);
exports.punishmentType = (0, pg_core_1.pgEnum)("punishment_type", [
    "BAN",
    "KICK",
    "WARN",
    "ROLE",
]);
//# sourceMappingURL=custom-types.js.map