import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/schemas",
	dialect: "postgresql",
	out: "./migrations",
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		url: process.env.DATABASE_URL!,
	},
});
