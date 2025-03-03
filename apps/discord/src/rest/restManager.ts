import { LogDepth, createLogger, createRestManager } from "@discordeno/bot";
import { DISCORD_TOKEN } from "../config.ts";
import { setupRestAnalyticsHooks } from "./influx.ts";

const manager = createRestManager({
	token: DISCORD_TOKEN,
});

export const logger = createLogger({ name: "REST" });
logger.setDepth(LogDepth.Full);

setupRestAnalyticsHooks(manager, logger);

export default manager;
