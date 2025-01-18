import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import type { dbSchema } from "./schemas/index.js";

export const db = drizzle<typeof dbSchema>({
	connection: {
		connectionString: process.env.DATABASE_URL,
		ssl: true,
	},
});
