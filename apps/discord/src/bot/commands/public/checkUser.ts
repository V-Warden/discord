import type { User } from "@discordeno/bot";
import userCheck from "../../actions/userCheck.ts";
import { bot } from "../../bot.ts";
import createCommand from "../../commands.ts";
import type { CommandInteraction } from "../../types/command.ts";
import type { UserCheck } from "../../types/userCheck.ts";
import embedBuilder from "../../utils/embed.ts";
import { formatStatus, formatType, getAllTypes } from "../../utils/misc.ts";

export const execute = async (interaction: CommandInteraction) => {
	if (!interaction.data || !interaction.data.options) {
		await interaction.respond("Interaction data not found.");
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
	const userData = (await bot.helpers.getUser(userId).catch((error) => {
		bot.logger.error("Error fetching user data", error);
		return embedBuilder(
			"error",
			"Check User",
			`❌ An error occurred while fetching <@${userId}>.\n > Please try again later.`,
		);
	})) as User;

	if (!userData) {
		await interaction.respond({
			embeds: [
				embedBuilder(
					"error",
					"Check User",
					`❌ <@${userId}> not found.\n > Please provide a valid user ID.`,
				),
			],
		});
		return;
	}

	if (userData.toggles && userData.toggles.bitfield === 1) {
		await interaction.respond({
			embeds: [
				embedBuilder(
					"warning",
					"Check User",
					`🤖 <@${userId}> is identified as a bot.\n > User checks cannot be performed on bots.`,
				),
			],
		});
		return;
	}

	const userDetails = (await userCheck(userId).catch((error) => {
		bot.logger.error("Error checking user", error);
		return embedBuilder(
			"error",
			"Check User",
			`❌ An error occurred while checking <@${userId}>.\n > Please try again later.`,
		);
	})) as UserCheck;

	if (
		!userDetails ||
		userDetails.user.status === "WHITELISTED" ||
		userDetails.user.status === "APPEALED"
	) {
		await interaction.respond({
			embeds: [
				embedBuilder(
					"success",
					"Check User",
					`✅ <@${userId}> is not blacklisted.\n > They are either fine or not yet listed.`,
				),
			],
		});
		return;
	}

	const types = getAllTypes(userDetails.user, userDetails.imports);
	const formattedTypes = [...types].map((type) => formatType(type)).join(", ");

	const infoForEachType = types.map((type) => {
		if (type === "OTHER") {
			return {
				type: "Other",
				info: "```Blacklisted for being in a server selling unauthorized products, services, or digital assets, such as stolen game accounts, pirated scripts, Rockstar/FiveM accounts, or unauthorized subscription resales.```",
			};
		}
		if (type === "LEAKER") {
			return {
				type: "Leaker",
				info: "```Blacklisted for being in a server distributing paid or private content without permission, including server dumps with paid assets or unauthorized RP server copies.```",
			};
		}
		if (type === "CHEATER") {
			return {
				type: "Cheater",
				info: "```Blacklisted for being in a server offering free or paid cheats, hacks, or unfair modifications, such as spoofers, cheat engines (e.g., redengine, HX Software, ESPs), mod menus, or visual tweaks that remove props or water.```",
			};
		}
		if (type === "SUPPORTER") {
			return {
				type: "Supporter",
				info: "```Blacklisted for financially supporting a blacklisted server, including boosting, holding a paid role, making purchases, or being in a customer-only server. Permanent blacklists for this reason retain the 'supporter' tag.```",
			};
		}
		if (type === "OWNER") {
			return {
				type: "Owner",
				info: "```Blacklisted for being a staff member or owner of a blacklisted server, including those with misconfigured moderation permissions. Permanent until the server owner successfully appeals.```",
			};
		}
	});

	const fields = [
		{
			inline: true,
			name: "Status:",
			value: `\`\`${formatStatus(userDetails.user.status)}\`\``,
		},
		{
			inline: true,
			name: "Types:",
			value: `\`\`${formattedTypes}\`\``,
		},
	];

	for (const info of infoForEachType) {
		if (info) {
			fields.push({
				inline: false,
				name: `${info.type} details:`,
				value: info.info,
			});
		}
	}

	await interaction.respond({
		embeds: [
			embedBuilder(
				"warning",
				"Check User",
				`⚠️ <@${userId}> is blacklisted. And has been seen in ${userDetails.imports.length} server${userDetails.imports.length > 1 ? "s" : ""}.`,
				fields,
			),
		],
	});
};

export default createCommand({
	name: "checkuser",
	description: "📋 Check if a user is blacklisted.",
	options: [
		{
			type: 6,
			name: "user",
			description: "The user or ID to check.",
			required: true,
		},
	],
	run: execute,
});
