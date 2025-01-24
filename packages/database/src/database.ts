import "dotenv/config";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { badServers } from "./schemas/bad-servers.js";
import { guilds } from "./schemas/guilds.js";
import { imports } from "./schemas/imports.js";
import { notes } from "./schemas/notes.js";
import { punishments } from "./schemas/punishments.js";
import { rolesArchive } from "./schemas/roles.js";
import { users } from "./schemas/users.js";

const getEnvVariable = (name: string) => {
	const value = process.env[name];
	if (value == null) throw new Error(`environment variable ${name} not found`);
	return value;
};

export const dbSchema = {
	users: users,
	notes: notes,
	badServers: badServers,
	imports: imports,
	guilds: guilds,
	punishments: punishments,
	rolesArchive: rolesArchive,
};

export const db: NodePgDatabase<typeof dbSchema> = drizzle<typeof dbSchema>({
	connection: {
		connectionString: getEnvVariable("DATABASE_URL"),
	},
	schema: dbSchema,
});
