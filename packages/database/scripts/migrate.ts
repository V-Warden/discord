// Credit to Enalmada (https://github.com/Enalmada/drizzle-helpers/blob/main/src/migrate/migrate.ts)

import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "../src/database";

export const databaseConfig = {
	RETRY_INTERVAL: process.env.DB_RETRY_INTERVAL
		? Number.parseInt(process.env.DB_RETRY_INTERVAL)
		: 1000,
	MAX_RETRIES: process.env.DB_MAX_RETRIES
		? Number.parseInt(process.env.DB_MAX_RETRIES)
		: 10,
};

// biome-ignore lint/suspicious/noExplicitAny: TBD
export const waitUntilDatabaseIsReady = async (sql: any): Promise<void> => {
	for (let attempts = 0; attempts < databaseConfig.MAX_RETRIES; attempts++) {
		try {
			await sql`SELECT 1`;
			return;
		} catch (err) {
			if (attempts === 0) {
				console.log(
					`⏳ Database not ready. Retrying every ${databaseConfig.RETRY_INTERVAL / 1000}s...`,
				);
			} else if (attempts === databaseConfig.MAX_RETRIES - 1) {
				throw new Error("⏳ Database not ready after maximum retries");
			}
			await new Promise((resolve) =>
				setTimeout(resolve, databaseConfig.RETRY_INTERVAL),
			);
		}
	}
};

export const runMigrate = async (migrationsFolder?: string): Promise<void> => {
	if (!migrationsFolder) {
		throw new Error("Migrations folder not provided");
	}

	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not defined");
	}

	try {
		console.log("⏳ Waiting for database to be ready...");
		await waitUntilDatabaseIsReady(db);

		console.log("⏳ Running migrations...");
		const start = Date.now();
		await migrate(db, { migrationsFolder });
		const end = Date.now();
		console.log(`✅ Migrations completed in ${end - start}ms`);
	} catch (err) {
		console.error("❌ Migration failed", err);
		throw err;
	}
};

runMigrate("migrations");
