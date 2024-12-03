import amqp from 'amqplib'
import logger from '../logger'
import { Client, TextChannel, EmbedBuilder } from 'discord.js'
import db from '../database'
import sendEmbed from '../messages/sendEmbed'
import { generateErrorID } from '../misc'
import { Colours } from '../../@types/Colours'
import { lruInfinity, setCache, getCache } from '../../utils/cache'

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

        const embed = new EmbedBuilder()
            .setTitle(':shield: Warden')
            .setDescription(
                `If you are receiving this message, you are blacklisted by the Warden bot, an anti-leaking/cheating and reselling bot.\n\n` +
                `You are automatically being **${punishment}** by **${member.guild.name}**.\n\n` +
                `This is because you are/were associated with **${realCount === 0 ? 1 : realCount}** leaking, cheating, or reselling Discord server${realCount === 1 ? '' : 's'}.\n` +
                `## [Join the Warden Discord](https://discord.gg/MVNZR73Ghf)\n` +
                `When you join, please read the questions channel.`
            )
            .setColor(Colours.BLUE)

        await chan.send({ embeds: [embed] })

        logger.info({
            labels: { queue: 'queueActionReceive', userId: id, guildId: member.guild.id },
            message: `Successfully send DM to user`,
        })
    } catch (e) {
        logger.error({
            labels: { queue: 'queueActionReceive', userId: id, guildId: member.guild.id },
            message: `Unable to create DM with user`,
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

    const settings = await db.getGuild({ id: guildId }, { logChannel: true, punishments: true })
    if (!settings?.logChannel) return false
    const logChannel = settings.logChannel
    const punishments = settings.punishments

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
