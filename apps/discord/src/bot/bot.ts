import { Collection, LogDepth, createBot, type logger } from "@discordeno/bot";
import {
	DISCORD_TOKEN,
	GATEWAY_AUTHORIZATION,
	GATEWAY_INTENTS,
	GATEWAY_URL,
	REST_AUTHORIZATION,
	REST_URL,
} from "../config.ts";
import type {
	ManagerGetShardInfoFromGuildId,
	ShardInfo,
	WorkerPresencesUpdate,
	WorkerShardPayload,
} from "../gateway/worker/types.ts";
import type { Command } from "./commands.ts";

const rawBot = createBot({
	token: DISCORD_TOKEN,
	intents: GATEWAY_INTENTS,
	// TEMPLATE-SETUP: Add/Remove the desired properties that you don't need
	desiredProperties: {
		user: {
			id: true,
			toggles: true,
			username: true,
		},
		interaction: {
			id: true,
			data: true,
			type: true,
			user: true,
			token: true,
			guildId: true,
		},
	},
	// Only include rest if not in test environment (integration tests)
	// so that the rest proxy is not used
	...(process.env.NODE_ENV !== "test"
		? {
				rest: {
					token: DISCORD_TOKEN,
					proxy: {
						baseUrl: REST_URL,
						authorization: REST_AUTHORIZATION,
					},
				},
			}
		: {}),
});

export const bot = rawBot as CustomBot;

// TEMPLATE-SETUP: If you want/need to add any custom properties on the Bot type, you can do it in these lines below and the `CustomBot` type below. Make sure to do it in both or else you will get an error by TypeScript
// We need to set the log depth for the default discordeno logger or else only the first param will be logged
(bot.logger as typeof logger).setDepth(LogDepth.Full);

bot.commands = new Collection();

// Required for testing environment (integration tests)
// so that the gateway proxy is not used
if (process.env.NODE_ENV !== "test") {
	overrideGatewayImplementations(bot);
}

export type CustomBot = typeof rawBot & {
	commands: Collection<string, Command>;
};

// Override the default gateway functions to allow the methods on the gateway object to proxy the requests to the gateway proxy
function overrideGatewayImplementations(bot: CustomBot): void {
	bot.gateway.sendPayload = async (shardId, payload) => {
		await fetch(GATEWAY_URL, {
			method: "POST",
			body: JSON.stringify({
				type: "ShardPayload",
				shardId,
				payload,
			} satisfies WorkerShardPayload),
			headers: {
				"Content-Type": "application/json",
				Authorization: GATEWAY_AUTHORIZATION,
			},
		});
	};

	bot.gateway.editBotStatus = async (payload) => {
		await fetch(GATEWAY_URL, {
			method: "POST",
			body: JSON.stringify({
				type: "EditShardsPresence",
				payload,
			} satisfies WorkerPresencesUpdate),
			headers: {
				"Content-Type": "application/json",
				Authorization: GATEWAY_AUTHORIZATION,
			},
		});
	};
}

export async function getShardInfoFromGuild(
	guildId?: bigint,
): Promise<Omit<ShardInfo, "nonce">> {
	// Required for testing environment (integration tests)
	if (process.env.NODE_ENV === "test") {
		return {
			shardId: 0,
			rtt: 0,
		};
	}

	const req = await fetch(GATEWAY_URL, {
		method: "POST",
		body: JSON.stringify({
			type: "ShardInfoFromGuild",
			guildId: guildId?.toString(),
		} as ManagerGetShardInfoFromGuildId),
		headers: {
			"Content-Type": "application/json",
			Authorization: GATEWAY_AUTHORIZATION,
		},
	});

	const res = await req.json();

	if (!req.ok) {
		const error = (res as { error: string }).error;
		throw new Error(`There was an issue getting the shard info: ${error}`);
	}

	return res as Omit<ShardInfo, "nonce">;
}
