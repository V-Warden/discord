import "dotenv/config";

import { join as joinPath } from "node:path";
import { getDirnameFromFileUrl } from "../util.ts";
import { bot } from "./bot.ts";
import importDirectory from "./utils/loader.ts";
import { updateCommands } from "./utils/updateCommands.ts";

// The importDirectory function uses 'readdir' that requires either a relative path compared to the process CWD or an absolute one, so to get one relative we need to use import.meta.url
const currentDirectory = getDirnameFromFileUrl(import.meta.url);

await importDirectory(joinPath(currentDirectory, "./commands"));

await updateCommands();

bot.logger.info("Done!");
