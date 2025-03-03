import { join as joinPath } from "node:path";
import { pathToFileURL } from "node:url";
import { Worker } from "node:worker_threads";
import {
	DISCORD_TOKEN,
	EVENT_HANDLER_AUTHORIZATION,
	EVENT_HANDLER_URL,
	GATEWAY_INTENTS,
	MESSAGEQUEUE_ENABLE,
	MESSAGEQUEUE_PASSWORD,
	MESSAGEQUEUE_URL,
	MESSAGEQUEUE_USERNAME,
} from "../../config.ts";
import { getDirnameFromFileUrl } from "../../util.ts";
import gatewayManager, { logger } from "../gatewayManager.ts";
import type {
	ManagerMessage,
	ShardInfo,
	WorkerCreateData,
	WorkerMessage,
} from "./types.ts";

// the string is the nonce of the request
export const shardInfoRequests = new Map<string, (value: ShardInfo) => void>();

export function createWorker(workerId: number): Worker {
	// the Worker constructor requires either a relative path compared to the process CWD or an absolute one, so to get one relative we need to use import.meta.url
	const currentFolder = getDirnameFromFileUrl(import.meta.url);
	const workerFilePath = joinPath(currentFolder, "./worker.ts");

	// Convert the worker file path to a file URL and wrap it with new URL
	const workerFileUrl = new URL(pathToFileURL(workerFilePath).href);

	const worker = new Worker(workerFileUrl, {
		workerData: {
			connectionData: {
				intents: GATEWAY_INTENTS,
				token: DISCORD_TOKEN,
				totalShards: gatewayManager.totalShards,
				url: gatewayManager.url,
				version: gatewayManager.version,
			},
			eventHandler: {
				urls: [EVENT_HANDLER_URL],
				authentication: EVENT_HANDLER_AUTHORIZATION,
			},
			workerId,
			messageQueue: {
				enabled: MESSAGEQUEUE_ENABLE,
				username: MESSAGEQUEUE_USERNAME,
				password: MESSAGEQUEUE_PASSWORD,
				url: MESSAGEQUEUE_URL,
			},
		} satisfies WorkerCreateData,
	});

	worker.on("message", async (message: ManagerMessage) => {
		if (message.type === "RequestIdentify") {
			logger.info(`Requesting identify for shardId: #${message.shardId}`);
			await gatewayManager.requestIdentify(message.shardId);

			worker.postMessage({
				type: "AllowIdentify",
				shardId: message.shardId,
			} satisfies WorkerMessage);

			return;
		}
		if (message.type === "ShardInfo") {
			shardInfoRequests.get(message.nonce)?.(message);
			shardInfoRequests.delete(message.nonce);
			return;
		}

		logger.warn(
			`Worker - Received unknown message type: ${(message as { type: string }).type}`,
		);
	});

	return worker;
}
