import { equal } from "node:assert";
import sinon from "sinon";
import { bot } from "../bot.js";
import type { CommandInteraction } from "../types/command.js";
import { execute } from "./ping.js";

describe("TypeScript usage suite", () => {
	const context: CommandInteraction = {
		user: {
			id: 1234567890123456789n,
			username: "veigar",
		},
		id: 1234567890123456789n,
		data: {
			name: "ping",
			options: [],
		},
		type: 2,
		token: "5",
		guildId: 1234567890123456789n,
		acknowledged: false,
		respond: sinon.fake(),
		edit: sinon.fake(),
		delete: sinon.fake(),
		deferEdit: sinon.fake(),
		defer: sinon.fake(),
		bot: bot,
	};

	it("should create a guild", async function () {
		this.timeout(10000);

		try {
			const result = await execute(context);
			console.log("Result:", result); // Let's see what we're getting back
			equal(result.id, context.guildId?.toString());
		} finally {
			sinon.restore();
		}
	});
});
