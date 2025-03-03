import type { bot } from "../bot.ts";

export type CommandInteraction =
	typeof bot.transformers.$inferredTypes.interaction;
