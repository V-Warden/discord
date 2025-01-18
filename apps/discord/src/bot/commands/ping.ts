import { snowflakeToTimestamp } from "@discordeno/bot";
import { createUser, findUserById } from "@warden/database";
import { getShardInfoFromGuild } from "../bot.js";
import createCommand from "../commands.js";

createCommand({
	name: "ping",
	description: "🏓 Check whether the bot is online and responsive.",
	async run(interaction) {
		const ping = Date.now() - snowflakeToTimestamp(interaction.id);
		const shardInfo = await getShardInfoFromGuild(interaction.guildId);

		const shardPing =
			shardInfo.rtt === -1 ? "*Not yet available*" : `${shardInfo.rtt}ms`;

		await createUser({
			id: interaction.user.id.toString(),
		});

		const user = await findUserById(interaction.user.id.toString());
		console.log(user);

		await interaction.respond(
			`🏓 Pong! Gateway Latency: ${shardPing}, Roundtrip Latency: ${ping}ms. I am online and responsive! 🕙`,
		);
	},
});
