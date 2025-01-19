import { snowflakeToTimestamp } from "@discordeno/bot";
import {
	createGuild,
	createPunishment,
	findPunishmentById,
	updatePunishment,
} from "@warden/database";
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

		const guild = await createGuild({
			id: interaction.guildId?.toString() ?? "12",
			name: "test",
		});

		console.log(guild);

		const punishment = await createPunishment({
			id: interaction.guildId?.toString() ?? "12",
		});

		console.log(punishment);

		await updatePunishment(interaction.guildId?.toString() ?? "12", {
			unban: {
				enabled: true,
				owner: true,
				supporter: true,
				leaker: true,
				cheater: true,
				other: false,
			},
		});

		const p = await findPunishmentById(interaction.guildId?.toString() ?? "12");

		console.log(p);

		await interaction.respond(
			`🏓 Pong! Gateway Latency: ${shardPing}, Roundtrip Latency: ${ping}ms. I am online and responsive! 🕙`,
		);
	},
});
