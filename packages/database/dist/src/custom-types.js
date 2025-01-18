"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snowflake = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.snowflake = (0, pg_core_1.customType)({
    dataType() {
        return "bigint";
    },
    // @ts-ignore
    fromDriver(value) {
        return value.toString();
    },
});
//# sourceMappingURL=custom-types.js.map