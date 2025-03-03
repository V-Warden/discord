import { inspect } from "node:util";
import { createEmbeds } from "@discordeno/bot";
import { BUGS_ERRORS_REPORT_WEBHOOK } from "../../config.ts";
import { bot } from "../bot.ts";
import { webhookURLToIDAndToken } from "../utils/webhook.ts";

process.on("unhandledRejection", async (error) => {
	bot.logger.error("An unhandled rejection occurred", error);

	if (!BUGS_ERRORS_REPORT_WEBHOOK || !error) return;

	const { id, token } = webhookURLToIDAndToken(BUGS_ERRORS_REPORT_WEBHOOK);

	if (!id || !token) return;

	const inspectedError = inspect(error);

	const embeds = createEmbeds()
		.setDescription(`\`\`\`${inspectedError}\`\`\``)
		.setFooter("Unhandled rejection occurred")
		.setTimestamp(Date.now());

	await bot.helpers.executeWebhook(id, token, { embeds });
});
