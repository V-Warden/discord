import { Client } from 'discord.js'
import logger from '../logger'

/**
 * Actions users globally, mainly used for forcecheck
 * @param client Client
 * @param ids Array of Discord user ids
 */
export default async function (c: Client, ids: string[]) {
    if (!c.shard)
        return logger.warn({
            labels: { action: 'actionUsersGlobal' },
            message: 'No shards online, unable to action appeal',
        })

    const result = await c.shard.broadcastEval(
        async (client, { userids }) => {
            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

            const output: any[] = []

            try {
                await client.guilds.fetch()
            } catch (error) {
                console.error('Error fetching guilds:', error)
                return output
            }

            for (let i = 0; i < client.guilds.cache.size; i++) {
                const guild = client.guilds.cache.at(i)
                if (!guild) continue

                try {
                    await guild.members.fetch({ user: userids })
                } catch (error) {
                    console.error(`Error fetching members for guild ${guild.id}:`, error)
                    continue
                }

                for (let a = 0; a < guild.members.cache.size; a++) {
                    const member = guild.members.cache.at(a)
                    if (!member) continue

                    if (userids.includes(member.id)) {
                        client.emit('guildMemberAdd', member)

                        output.push({
                            labels: { action: 'actionUsersGlobal', userId: member.id },
                            message: `Actioning user globally in guild ${guild.id}`,
                        })
                    }
                }

                await delay(100)
            }

            return output
        },
        { context: { userids: ids } }
    )

    for (let index = 0; index < result.length; index++) {
        for (let i = 0; i < result.length; i++) {
            logger.info(result[index][i])
        }
    }

    return true
}
