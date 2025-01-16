import { Client, TextChannel, EmbedBuilder } from 'discord.js'
import { lruInfinity, setCache, getCache } from '../cache'
import db from '../database'
import logger from '../logger'
import { Colours } from '../../@types/Colours'

let previousBlacklistedUsers = 0
let totalNewUsersAdded = 0

const liveStatus = async (client: Client) => {
    const statusChannelId = process.env.statusChannelId
    if (!statusChannelId) {
        logger.error('Status channel ID is not set in the environment variables')
        return
    }

    const statusChannel = client.channels.cache.get(statusChannelId) as TextChannel
    if (!statusChannel) {
        logger.error(`Status channel with ID ${statusChannelId} not found`)
        return
    }

    previousBlacklistedUsers = await db.countAllBlacklistedUsers()

    const postStatus = async () => {
        const botStartTime = Number(await getCache('botStartTime', lruInfinity))
        const botStartTimeSeconds = Math.floor(botStartTime / 1000)

        const blacklistedUsersPromise = db.countAllBlacklistedUsers()
        const blacklistedServersPromise = db.countAllBlacklistedServers()

        const [blacklistedUsers, blacklistedServers] = await Promise.all([
            blacklistedUsersPromise,
            blacklistedServersPromise,
        ])

        const newUsersAdded = blacklistedUsers - previousBlacklistedUsers
        totalNewUsersAdded += newUsersAdded
        previousBlacklistedUsers = blacklistedUsers

        const res = await client.shard?.broadcastEval(client => {
            return {
                guilds: client.guilds.cache.size,
            }
        })

        if (!res) {
            logger.error('No shards available..?')
            return
        }

        const guilds = res.reduce((a, b) => a + b.guilds, 0)

        const embed = new EmbedBuilder()
            .setTitle(':desktop: Statistics & Information')
            .setColor(Colours.BLUE)
            .addFields([
                {
                    name: 'General Statistics', value: `
                    > \`${client.shard?.count ?? 0}\` shard${(client.shard?.count ?? 0) > 1 ? 's' : ''}
                    > \`${guilds}\` guilds are protected
                    > \`${(await getCache('actionQueue', lruInfinity) || 0) + (await getCache('consumerCount', lruInfinity) || 0)}\` users in the queue
                    > \`${await getCache('actionMessages', lruInfinity) || 0}\` users processed`, inline: false
                },
                {
                    name: 'Database Statistics', value: `
                    > \`${blacklistedServers.toLocaleString()}\` blacklisted servers
                    > \`${blacklistedUsers.toLocaleString()}\` blacklisted users
                    > \`${newUsersAdded}\` new blacklisted users added since last update
                    > \`${totalNewUsersAdded}\` total new blacklisted users added since bot started`, inline: false
                },
                {
                    name: 'Bot Statistics', value: `
                    > Uptime <t:${botStartTimeSeconds}:R>
                    > Usage \`${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100}\` MB`, inline: false
                },
                {
                    name: 'Last & Next Update', value: `
                    > Last updated was <t:${Math.floor(Date.now() / 1000)}:R>
                    > Next update is <t:${Math.floor((Date.now() + 5 * 60 * 1000) / 1000)}:R>`, inline: false
                },
            ])
            .setFooter({ text: `Warden - Shard ${client.shard?.ids[0]}` })

        let statusMessageId = await getCache('statusMessageId', lruInfinity)
        let statusMessage

        if (statusMessageId) {
            statusMessage = await statusChannel.messages.fetch(statusMessageId).catch(() => null)
        }

        if (!statusMessage) {
            const messages = await statusChannel.messages.fetch({ limit: 1 })
            statusMessage = messages.first()

            if (statusMessage) {
                statusMessageId = statusMessage.id
                await setCache('statusMessageId', statusMessageId, lruInfinity)
            }
        }

        if (statusMessage) {
            await statusMessage.edit({ embeds: [embed] })
        } else {
            const newStatusMessage = await statusChannel.send({ embeds: [embed] })
            await setCache('statusMessageId', newStatusMessage.id, lruInfinity)
        }
    }

    await postStatus()

    setInterval(postStatus, 5 * 60 * 1000)
}

export { liveStatus }
