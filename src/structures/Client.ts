import {
    ActivityType,
    ApplicationCommandDataResolvable,
    ApplicationCommandType,
    Client,
    ClientEvents,
    Collection,
    GatewayIntentBits,
    Invite,
} from 'discord.js';
import { glob } from 'glob';
import { Event } from './Event';
import { RegisterCommandsOptions, CommandType, MenuType } from '../@types';
import path from 'path';
import logger from '../utils/logger';
import { startReceiver } from '../utils/queues/queueActionReceive';

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();
    contextmenus: Collection<string, MenuType> = new Collection();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildBans,
                GatewayIntentBits.GuildMessages,
            ],
            waitGuildTimeout: 1000,
        });
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
            logger.info({ message: 'Registering guildSpecfic' });
        } else {
            await this.application?.commands.set(commands);
            logger.info({ message: 'Registering globalCommands' });
        }
    }

    async registerModules() {
        // Commands
        const globalCommands: ApplicationCommandDataResolvable[] = [];
        const guildSpecfic: ApplicationCommandDataResolvable[] = [];

        const root = path.join(__dirname, '..');
        const commandFiles = await this.getFiles(path.join(root, 'commands'));

        for (const filePath of commandFiles) {
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
        }

        this.on('ready', async () => {
            await this.registerCommands({
                commands: globalCommands,
            });

            await this.registerCommands({
                commands: guildSpecfic,
                guildId: process.env.guildId,
            });

            this.user?.setActivity({
                type: ActivityType.Watching,
                name: 'discord.gg/MVNZR73Ghf',
            });

            startReceiver(this).catch((e) => {
                logger.error({ message: 'Error starting receiver', error: e });
            });
        });

        // Events
        const eventFiles = await this.getFiles(path.join(root, 'events'));
        logger.info({ message: 'Registering events' });
        for (const filePath of eventFiles) {
            const event: Event<keyof ClientEvents> = await this.importFile(filePath);
            this.on(event.event, event.run);
        }
    }

    async getFiles(dir: string): Promise<string[]> {
        const pattern = `${dir}/**/*.{ts,js}`;
        return await glob(pattern, {});
    }

    async isValidInvite(invite: string): Promise<undefined | Invite> {
        try {
            return await this.fetchInvite(invite);
        } catch {
            return undefined;
        }
    }
}
