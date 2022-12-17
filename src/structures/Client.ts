import {
    ActivityType,
    ApplicationCommandDataResolvable,
    ApplicationCommandType,
    Client,
    ClientEvents,
    Collection,
    Invite,
} from 'discord.js';
import glob from 'glob';
import { promisify } from 'util';
import { Event } from './Event';
import { RegisterCommandsOptions, CommandType, MenuType } from '../@types';
import path from 'path';
import logger from '../utils/logger';
import { Database } from './Database';

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();
    contextmenus: Collection<string, MenuType> = new Collection();
    prisma: Database = new Database();

    constructor() {
        super({ intents: 519, waitGuildTimeout: 1000 });
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
            this.guilds.cache.get(guildId)?.commands.set(commands);
            logger.info({ labels: { guildId }, message: 'Registering commands' });
        } else {
            this.application?.commands.set(commands);
            logger.info({ message: 'Registering global commands' });
        }
    }

    async registerModules() {
        // Commands
        const globalCommands: ApplicationCommandDataResolvable[] = [];
        const guildSpecfic: ApplicationCommandDataResolvable[] = [];

        const root = path.join(__dirname, '..');
        const commandFiles = await globPromise('/commands/*/*{.ts,.js}', { root });

        commandFiles.forEach(async filePath => {
            const command: CommandType | MenuType = await this.importFile(filePath);
            if (!command.name) return;

            if (command?.main) {
                guildSpecfic.push(command);
            } else {
                globalCommands.push(command);
            }
            if (command.type === ApplicationCommandType.ChatInput) {
                this.commands.set(command.name, command);
            } else {
                this.contextmenus.set(command.name, command as MenuType);
            }
        });

        this.on('ready', () => {
            this.application?.commands.set([]);
            this.registerCommands({
                commands: globalCommands,
            });
            this.registerCommands({
                commands: guildSpecfic,
                guildId: process.env.guildId,
            });

            this.user?.setActivity({
                type: ActivityType.Watching,
                name: 'discord.gg/warden',
            });
        });

        // Events
        const eventFiles = await globPromise('/events/*{.ts,.js}', { root });
        logger.info({ message: 'Registering events' });
        eventFiles.forEach(async filePath => {
            const event: Event<keyof ClientEvents> = await this.importFile(filePath);
            this.on(event.event, event.run);
        });
    }

    async isValidInvite(invite: string): Promise<undefined | Invite> {
        let server: Invite | undefined = undefined;
        try {
            server = await this.fetchInvite(invite);
        } catch {
            // Invalid invite
        }

        return server;
    }
}
