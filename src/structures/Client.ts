import {
  ActivityType,
  ApplicationCommandDataResolvable,
  ApplicationCommandType,
  Client,
  ClientEvents,
  Collection,
  Intents,
} from 'discord.js';
import glob from 'glob';
import { promisify } from 'util';
import { Event } from './Event';
import { RegisterCommandsOptions, CommandType, MenuType } from '../@types';
import path from 'path';
import logger from '../utils/logger';

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection();
  contextmenus: Collection<string, MenuType> = new Collection();

  constructor() {
    super({ intents: Intents.FLAGS.GUILDS }); // Use specific intents
  }

  start() {
    this.registerModules();
    this.login(process.env.token);
  }

  async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
    if (guildId) {
      await this.guilds.cache.get(guildId)?.commands.set(commands);
      logger.info({ labels: { guildId }, message: 'Registering commands' });
    } else {
      await this.application?.commands.set(commands);
      logger.info({ message: 'Registering global commands' });
    }
  }

  async registerModules() {
    // Commands
    const commandFiles = await globPromise('/commands/*/*{.ts,.js}', { root: __dirname, nodir: true });
    const commands: ApplicationCommandDataResolvable[] = [];

    for (const filePath of commandFiles) {
      const command: CommandType | MenuType = await this.importFile(filePath);
      if (!command.name) continue;

      commands.push(command);
      if (command.type === ApplicationCommandType.ChatInput) {
        this.commands.set(command.name, command);
      } else {
        this.contextmenus.set(command.name, command as MenuType);
      }
    }

    this.on('ready', async () => {
      await this.registerCommands({ commands: guildSpecfic, guildId: process.env.guildId });
      this.user?.setActivity({ type: ActivityType.Watching, name: 'discord.gg/MVNZR73Ghf' });
    });

    // Events
    const eventFiles = await globPromise('/events/*{.ts,.js}', { root: __dirname, nodir: true });
    logger.info({ message: 'Registering events' });

    for (const filePath of eventFiles) {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath);
      this.on(event.event, event.run);
    }
  }

  async isValidInvite(invite: string): Promise<undefined | Invite> {
    try {
      return await this.fetchInvite(invite);
    } catch {
      return undefined; // Explicitly return undefined on error
    }
  }
}
