import {
    ActivityType,
    ApplicationCommandDataResolvable,
    ApplicationCommandType,
    Client,
    ClientEvents,
    Collection,
    GatewayIntentBits,
    Invite,
} from 'discord.js'
import { glob } from 'glob'
import { Event } from './Event'
import { RegisterCommandsOptions, CommandType, MenuType } from '../@types'
import path from 'path'
import logger from '../utils/logger'
import { startReceiver } from '../utils/queues/queueActionReceive'
import { lruInfinity, setCache } from '../utils/cache'
import { liveStatus } from '../utils/status/liveStatus'
 
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
        })
    }

    start() {
        this.registerModules()
        this.login(process.env.token)
    }

    async importFile(filePath: string) {
        return (await import(filePath))?.default
    }

    async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
        if (guildId) {
            await this.guilds.cache.get(guildId)?.commands.set(commands).catch((e) => {
                logger.error({ message: 'Error registering guild commands', error: e instanceof Error ? e.message : JSON.stringify(e) })
            })
            logger.info({ message: 'Registering guildSpecfic' })
        } else {
            await this.application?.commands.set(commands).catch((e) => {
                logger.error({ message: 'Error registering global commands', error: e instanceof Error ? e.message : JSON.stringify(e) })
            })
            logger.info({ message: 'Registering globalCommands' })
        }
    }

    async registerModules() {
        // Commands
        const globalCommands: ApplicationCommandDataResolvable[] = []
        const guildSpecfic: ApplicationCommandDataResolvable[] = []

        const root = path.join(__dirname, '..')
        const commandFiles = await this.getFiles(path.join(root, 'commands'))

        for (const filePath of commandFiles) {
            const command: CommandType | MenuType = await this.importFile(filePath)
            if (!command.name) return

            if (command?.main) {
                guildSpecfic.push(command)
            } else {
                globalCommands.push(command)
            }
            if (command.type === ApplicationCommandType.ChatInput) {
                this.commands.set(command.name, command)
            } else {
                this.contextmenus.set(command.name, command as MenuType)
            }
        }

        this.on('ready', async () => {
            await this.registerCommands({
                commands: globalCommands,
            }).catch((e) => {
                logger.error({ message: 'Error registering global commands', error: e instanceof Error ? e.message : JSON.stringify(e) })
            })

            await this.registerCommands({
                commands: guildSpecfic,
                guildId: process.env.guildId,
            }).catch((e) => {
                logger.error({ message: 'Error registering guild commands', error: e instanceof Error ? e.message : JSON.stringify(e) })
            })

            this.user?.setActivity({
                type: ActivityType.Watching,
                name: 'discord.gg/MVNZR73Ghf',
            })

            const botStartTime = Date.now()
            await setCache('botStartTime', botStartTime, lruInfinity)

            startReceiver(this).catch((e) => {
                logger.error({ message: 'Error starting receiver', error: e instanceof Error ? e.message : JSON.stringify(e) })
            })

            liveStatus(this).catch((e) => {
                logger.error({ message: 'Error starting liveStatus', error: e instanceof Error ? e.message : JSON.stringify(e) })
            })
        })

        // Events
        const eventFiles = await this.getFiles(path.join(root, 'events'))
        logger.info({ message: 'Registering events' })
        for (const filePath of eventFiles) {
            const event: Event<keyof ClientEvents> = await this.importFile(filePath)
            this.on(event.event, event.run)
        }
    }

    async getFiles(dir: string): Promise<string[]> {
        const pattern = `${dir}/**/*.{ts,js}`
        return await glob(pattern, {})
    }

    async isValidInvite(invite: string): Promise<undefined | Invite> {
        try {
            return await this.fetchInvite(invite)
        } catch {
            logger.error({ message: 'Invalid invite' })
            return undefined
        }
    }
}
