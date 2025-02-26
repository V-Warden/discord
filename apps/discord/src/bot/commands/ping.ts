import { snowflakeToTimestamp } from "@discordeno/bot";
import { createGuild } from "@warden/database";
import { getShardInfoFromGuild } from "../bot.js";
import createCommand from "../commands.js";
import type { CommandInteraction } from "../types/command.js";

export const execute = async (interaction: CommandInteraction) => {
	const ping = Date.now() - snowflakeToTimestamp(BigInt(interaction.id));
	const shardInfo = await getShardInfoFromGuild(interaction.guildId);

	const shardPing =
		shardInfo.rtt === -1 ? "*Not yet available*" : `${shardInfo.rtt}ms`;

	const guild = await createGuild({
		id: interaction.guildId?.toString() ?? "12",
		name: "test",
	});

	return guild;

	// console.log("guild", guild);

	// const punishment = await createPunishment({
	// 	id: interaction.guildId?.toString() ?? "12",
	// });

	// console.log("punishment", punishment);

	// await updatePunishment(interaction.guildId?.toString() ?? "12", {
	// 	unban: {
	// 		enabled: true,
	// 		owner: true,
	// 		supporter: true,
	// 		leaker: true,
	// 		cheater: true,
	// 		other: false,
	// 	},
	// });

	// const p = await findPunishmentById(interaction.guildId?.toString() ?? "12");

	// console.log("p", p);

	// await interaction.respond(
	// 	`🏓 Pong! Gateway Latency: ${shardPing}, Roundtrip Latency: ${ping}ms. I am online and responsive! 🕙`,
	// );
};

export default createCommand({
	name: "ping",
	description: "🏓 Check whether the bot is online and responsive.",
	run: execute,
});
