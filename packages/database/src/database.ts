import "dotenv/config";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "./schemas/users";

const getEnvVariable = (name: string) => {
	const value = process.env[name];
	if (value == null) throw new Error(`environment variable ${name} not found`);
	return value;
};

export const dbSchema = {
	users: users,
};

export const db: NodePgDatabase<typeof dbSchema> = drizzle<typeof dbSchema>({
	connection: {
		connectionString: getEnvVariable("DATABASE_URL"),
	},
	schema: dbSchema,
});
