import { bot } from "../../bot.ts";
import createCommand from "../../commands.ts";
import type { CommandInteraction } from "../../types/command.ts";
import { embedError, embedInfo, embedWarning } from "../../utils/embed.ts";

export const execute = async (interaction: CommandInteraction) => {
	if (!interaction.data || !interaction.data.options) {
		await interaction.respond("Interaction data or options not found.");
		return;
	}

	const userOption = interaction.data.options.find(
		(option) => option.name === "user",
	);

	if (!userOption || !userOption.value) {
		await interaction.respond("User option not found or invalid.");
		return;
	}

	const userId = String(userOption.value);
	const userData = await bot.helpers.getUser(userId);

	if (!userData) {
		await interaction.respond({
			embeds: [embedError("Check User", "User not found")],
		});
		return;
	}

	if (userData.toggles && userData.toggles.bitfield === 1) {
		await interaction.respond({
			embeds: [
				embedWarning(
					"Check User",
					"🤖 This user is identified as a bot. User checks cannot be performed on bot accounts.",
				),
			],
		});
		return;
	}

	await interaction.respond({
		embeds: [embedInfo("Check User", "User is clean")],
	});
};

export default createCommand({
	name: "checkuser",
	description: "📋 Check if a user is blacklisted.",
	options: [
		{
			type: 6,
			name: "user",
			description: "The user or id to check.",
			required: true,
		},
	],
	run: execute,
});
