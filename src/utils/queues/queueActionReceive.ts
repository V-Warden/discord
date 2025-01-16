import { Client, TextChannel, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, MessageActionRowComponentBuilder, ComponentType } from 'discord.js'
import { Colours } from '../../@types/Colours'
import { generateErrorID } from '../misc'
import { lruInfinity, setCache, getCache } from '../../utils/cache'
import amqp from 'amqplib'
import db from '../database'
import logger from '../logger'
import sendEmbed from '../messages/sendEmbed'

const USERNAME = process.env.RABBITMQ_USER
const PASSWORD = process.env.RABBITMQ_PASS
const HOST = process.env.RABBITMQ_HOST

let connection: amqp.Connection | null = null
let channel: amqp.Channel | null = null
const messageQueue: (() => Promise<void>)[] = []

async function getChannel() {
    if (!connection) {
        connection = await amqp.connect(`amqp://${USERNAME}:${PASSWORD}@${HOST}`!)
    }
    if (!channel) {
        channel = await connection.createChannel()
        const queue = 'actionUser'
        await channel.assertQueue(queue, { durable: true })
    }
    return channel
}

async function dmUser(client: Client, id: string, guildId: string, toDo: string) {
    const guild = await client.guilds.fetch(guildId)
    if (!guild) return false
    const member = await guild.members.fetch(id)
    if (!member) return false
    const user = await db.getUser(id)
    if (!user) return false
    if (user?.status === 'APPEALED') return false
    if (user?.status === 'WHITELISTED') return false
    if (member.user.bot) return false

    const importsPromise = db.getImports(id)
    const allImportsPromise = db.getAllImports(user.id)
    const [imports, allImports] = await Promise.all([importsPromise, allImportsPromise])

    if (allImports.length === 0) return false

    let realCount = 0
    try {
        if (imports.length === 1) {
            const toParse = imports[0].roles
            if (toParse.includes('"servers":')) {
                const parsed = JSON.parse(toParse)
                const servers: string[] = parsed['servers'].split(';')
                realCount = servers.length
            } else {
                realCount = 1
            }
        } else {
            realCount = imports.length
        }
    } catch (e) {
        return logger.error({
            labels: { queue: 'queueActionReceive', userId: id, guildId: member.guild.id },
            message: e instanceof Error ? e.message : JSON.stringify(e),
        })
    }

    try {
        const chan = await member.createDM()
        let punishment = null
        switch (toDo) {
            case 'WARN':
                punishment = 'warned'
                break
            case 'KICK':
                punishment = 'kicked'
                break
            case 'BAN':
                punishment = 'banned'
                break
            case 'ROLE':
                punishment = 'given a role'
                break
        }
        let s = ''
        let are = 'is'
        if (realCount > 1) {
            s = 's'
            are = 'is'
        }

        const languageSelector = (current: string) => {
            const languageSelect = new StringSelectMenuBuilder()
                .setCustomId('language_select')
                .setPlaceholder('Select an option')
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('English')
                        .setDescription('Translate to English')
                        .setValue('en')
                        .setDefault(current === 'en'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Nederlands')
                        .setDescription('Vertaal naar Nederlands')
                        .setValue('nl')
                        .setDefault(current === 'nl')
                )

            const rows = [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(languageSelect),
            ]

            return rows
        }

        const embed = new EmbedBuilder()
            .setTitle(':shield: Warden')
            .setDescription(
                `If you are receiving this message, you are blacklisted by the Warden bot, an anti-leaking/cheating and reselling bot.\n\n` +
                `You are automatically being **${punishment}** by **${member.guild.name}**.\n\n` +
                `This is because you are/were associated with **${realCount === 0 ? 1 : realCount}** leaking, cheating or reselling Discord server${realCount === 1 ? '' : 's'}.\n` +
                `## [Join the Warden Discord](https://discord.gg/MVNZR73Ghf)\n` +
                `When you join, please read the "questions" channel.`
            )
            .setColor(Colours.BLUE)

        const dmMessage = await chan.send({ embeds: [embed], components: languageSelector('en') })

        const collectorStringSelect = dmMessage.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 600000,
        })

        collectorStringSelect.on('collect', async (interaction) => {
            try {
                if (interaction.customId === 'language_select') {
                    const lang = interaction.values[0]
                    let translation = ''
                    switch (lang) {
                        case 'en':
                            translation = `If you are receiving this message, you are blacklisted by the Warden bot, an anti-leaking/cheating and reselling bot.\n\n` +
                                `You are automatically being **${punishment}** by **${member.guild.name}**.\n\n` +
                                `This is because you are/were associated with **${realCount === 0 ? 1 : realCount}** leaking, cheating or reselling Discord server${realCount === 1 ? '' : 's'}.\n` +
                                `## [Join the Warden Discord](https://discord.gg/MVNZR73Ghf)\n` +
                                `When you join, please read the "questions" channel.`
                            break
                        case 'nl':
                            let punishmentTranslated = ''

                            switch (toDo) {
                                case 'WARN':
                                    punishmentTranslated = 'gewaarschuwd'
                                    break
                                case 'KICK':
                                    punishmentTranslated = 'gekickt'
                                    break
                                case 'BAN':
                                    punishmentTranslated = 'verbannen'
                                    break
                                case 'ROLE':
                                    punishmentTranslated = 'een rol gegeven'
                                    break
                            }

                            translation = `Als je dit bericht ontvangt, sta je op de zwarte lijst van de Warden bot, een anti-leaking/cheating en reselling bot.\n\n` +
                                `Je wordt automatisch **${punishmentTranslated}** door **${member.guild.name}**.\n\n` +
                                `Dit is omdat je geassocieerd bent met **${realCount === 0 ? 1 : realCount}** leaking, cheating of reselling Discord server${realCount === 1 ? '' : 's'}.\n` +
                                `## [Join de Warden Discord](https://discord.gg/MVNZR73Ghf)\n` +
                                `Als je lid wordt, lees dan het "questions" kanaal.`
                            break

                        default:
                            break
                    }

                    dmMessage.edit({ embeds: [embed.setDescription(translation)], components: languageSelector(lang) })
                }
            } catch (e) {
                logger.error({
                    labels: { queue: 'queueActionReceive', userId: id, guildId: member.guild.id },
                    message: `Error in collectorStringSelect: ${e instanceof Error ? e.message : JSON.stringify(e)}`,
                })
            }

            return interaction.deferUpdate().catch((e) => {
                logger.error({
                    labels: { queue: 'queueActionReceive', userId: id, guildId: member.guild.id },
                    message: `Error in collectorStringSelect: ${e instanceof Error ? e.message : JSON.stringify(e)}`,
                })
            })
        })

        logger.info({
            labels: { queue: 'queueActionReceive', userId: id, guildId: member.guild.id },
            message: `Successfully send DM to user`,
        })
    } catch (e) {
        logger.error({
            labels: { queue: 'queueActionReceive', userId: id, guildId: member.guild.id },
            message: `Unable to create DM with user: ${e instanceof Error ? e.message : JSON.stringify(e)}`,
        })
    }

    return true
}

async function actionUser(client: Client, id: string, guildId: string, toDo: string) {
    const guild = await client.guilds.fetch(guildId)
    if (!guild) return false
    const member = await guild.members.fetch(id)
    if (!member) return false
    const user = await db.getUser(id)
    if (!user) return false
    if (user?.status === 'WHITELISTED') return false
    if (member.user.bot) return false

    const importsPromise = db.getImports(id)
    const allImportsPromise = db.getAllImports(user.id)
    const [imports, allImports] = await Promise.all([importsPromise, allImportsPromise])

    if (allImports.length === 0) return false

    let realCount = 0
    try {
        if (imports.length === 1) {
            const toParse = imports[0].roles
            if (toParse.includes('"servers":')) {
                const parsed = JSON.parse(toParse)
                const servers: string[] = parsed['servers'].split(';')
                realCount = servers.length
            } else {
                realCount = 1
            }
        } else {
            realCount = imports.length
        }
    } catch (e) {
        return logger.error({
            labels: { queue: 'queueActionReceive', userId: id, guildId: member.guild.id },
            message: e instanceof Error ? e.message : JSON.stringify(e),
        })
    }

    const settings = await db.getGuild({ id: guildId }, { logChannel: true, punishments: true })
    if (!settings?.logChannel) return false
    const logChannel = settings.logChannel
    const punishments = settings?.punishments

    let channel: TextChannel
    try {
        channel = (await guild.channels.fetch(logChannel ?? '')) as TextChannel
    } catch {
        return false
    }

    if (settings?.punishments?.roleId) await member.roles.remove(settings?.punishments?.roleId, 'Removing role to be actioned')

    let action = null
    if (toDo === 'BAN') {
        action = member.ban({ reason: `Warden - User Type ${user.type}` })
    } else if (toDo === 'KICK') {
        action = member.kick(`Warden - User Type ${user.type}`)
    }

    if (!action) return false


    try {
        await action

        if (toDo === 'BAN')
            await db.createBan({ id: user.id, Guild: { connect: { id: punishments?.id } } })

        logger.info({
            labels: { queue: 'queueActionReceive', userId: id, guildId: member.guild.id },
            message: `Successfully ${toDo} user`,
        })

        sendEmbed({
            channel,
            embed: {
                description: `:shield: User <@${member.id
                    }> has been punished with a ${toDo}.\nThey have been seen in ${realCount == 0 ? 1 : realCount} bad discord servers.\n**User Status**: ${user.status.toLowerCase()}`,
                color: Colours.GREEN,
            },
        })

        return true
    } catch (e) {
        const errorId = generateErrorID()

        sendEmbed({
            channel,
            embed: {
                description: `\`🔴\` I have failed to issue a ${toDo} against <@${user.id}> due to insufficient permissions.\n> Error ID: ${errorId}`,
                color: Colours.RED,
            },
        })

        return logger.error({
            labels: { queue: 'queueActionReceive', guildId: member.guild.id, errorId: errorId },
            message: e instanceof Error ? e.message : JSON.stringify(e),
        })
    }
}

async function updateTotalQueue() {
    if (channel) {
        const queue = 'actionUser'
        const queueInfo = await channel.checkQueue(queue)
        await setCache('actionQueue', queueInfo.messageCount, lruInfinity)
    }
}

async function processMessage(client: Client, msg: amqp.ConsumeMessage | null) {
    if (msg) {
        const content = msg.content.toString()
        const { id, guildId, punishment } = JSON.parse(content)
        await setCache('consumerCount', (await getCache('consumerCount', lruInfinity) || 0) + 1, lruInfinity)

        messageQueue.push(async () => {
            try {
                logger.info({
                    labels: { queue: 'queueActionReceive', userId: id, guildId: guildId },
                    message: `Processing user from queue with ${punishment}`
                })

                await dmUser(client, id, guildId, punishment)
                if (punishment === 'BAN' || punishment === 'KICK') await actionUser(client, id, guildId, punishment)
                channel!.ack(msg)

                const getMessages = await getCache('actionMessages', lruInfinity)
                const messageCount = getMessages ? getMessages + 1 : 1
                await setCache('actionMessages', messageCount, lruInfinity)
                await updateTotalQueue()
                const consumerCount = await getCache('consumerCount', lruInfinity) || 0
                await setCache('consumerCount', consumerCount > 0 ? consumerCount - 1 : consumerCount, lruInfinity)

                // Wait 1s between each dmUser
                await new Promise(resolve => setTimeout(resolve, 1000))

                // Every 10 DMs, wait 10s seconds
                if (messageCount % 10 === 0) {
                    logger.info({ message: `Processed ${messageCount} users, waiting 10 seconds` })
                    await new Promise(resolve => setTimeout(resolve, 10000))
                }
            } catch (error) {
                channel!.ack(msg)

                const getMessages = await getCache('actionMessages', lruInfinity)
                const messageCount = getMessages ? getMessages + 1 : 1
                await setCache('actionMessages', messageCount, lruInfinity)
                await updateTotalQueue()
                const consumerCount = await getCache('consumerCount', lruInfinity) || 0
                await setCache('consumerCount', consumerCount > 0 ? consumerCount - 1 : consumerCount, lruInfinity)

                logger.error({
                    labels: { queue: 'queueActionReceive', guildId: guildId },
                    message: `Error processing message for user ${id}: ${error}`,
                })
            }
        })
    }
}

async function processQueue() {
    while (true) {
        if (messageQueue.length > 0) {
            const task = messageQueue.shift()
            if (task) await task()
        } else {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
    }
}

async function totalQueue() {
    if (channel) {
        const queue = 'actionUser'
        const queueInfo = await channel.checkQueue(queue)
        await setCache('actionQueue', queueInfo.messageCount, lruInfinity)
        return queueInfo.messageCount + (await getCache('consumerCount', lruInfinity) || 0)
    }

    return 0
}

async function logQueueStatus() {
    if (channel) {
        logger.info({ message: `Total users to be actioned left in queue: ${await totalQueue()}` })
    }
}

async function startReceiver(client: Client) {
    logger.info({ message: 'Starting receiver' })
    const channel = await getChannel()
    const queue = 'actionUser'
    channel.consume(queue, (msg) => processMessage(client, msg), { noAck: false })

    setInterval(logQueueStatus, 5 * 60 * 1000)

    // Start processing the message queue
    processQueue().catch(console.error)
}

export { startReceiver }
