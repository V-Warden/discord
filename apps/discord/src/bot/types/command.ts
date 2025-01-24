import type { bot } from "../bot.js";

export type CommandInteraction =
	typeof bot.transformers.$inferredTypes.interaction;
