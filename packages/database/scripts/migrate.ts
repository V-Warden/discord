import "dotenv/config";

import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "../src/database";

const main = async () => {
	await migrate(db, {
		migrationsFolder: "migrations",
	});
	console.log("Migrations completed");
	process.exit(0);
};

void main();
