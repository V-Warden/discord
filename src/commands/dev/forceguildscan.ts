import { ApplicationCommandOptionType } from 'discord.js'
import { Command } from '../../structures/Command'
import { sendError, sendSuccess } from '../../utils/messages'
import db from '../../utils/database'
import logger from '../../utils/logger'

export default new Command({
    name: 'forceguildscan',
    description: 'Forcefully runs a user scan on a specific guild',
    main: true,
    defaultMemberPermissions: 'Administrator',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'id',
            description: 'Guild ID',
            required: true,
        },
    ],
    run: async ({ interaction, client }) => {
        const id = interaction.options.get('id')?.value as string

        if (!client.shard) {
            logger.warn({
                labels: { command: 'forceguildscan', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: 'No shards online, unable to action appeal',
            })
            return sendError(interaction, 'No shards online, unable to run this command')
        }

        const settings = await db.getGuild({ id: id }, { punishments: true }).catch(e => {
            logger.error({
                labels: { command: 'forceguildscan', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: e instanceof Error ? e.message : JSON.stringify(e),
            })
        })
        if (!settings) return sendError(interaction, 'Unable to find guild in the database')

        const punishRole = settings?.punishments?.roleId
        if (!punishRole) return sendError(interaction, 'Invalid punish role set')

        const result = await client.shard.broadcastEval(
            async (client, { guild }) => {
                const output: any[] = []

                await client.guilds.fetch().catch(e => {
                    logger.error({
                        labels: { command: 'forceguildscan', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                })

                const g = client.guilds.cache.get(guild)
                if (!g) return output

                await g.members.fetch().catch(e => {
                    logger.error({
                        labels: { command: 'forceguildscan', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                })

                for (let a = 0; a < g.members.cache.size; a++) {
                    const member = g.members.cache.at(a)
                    if (!member) continue

                    client.emit('guildMemberAdd', member)

                    output.push({
                        labels: { command: 'forceguildscan', guildId: g.id },
                        message: `Emitted guildMemberAdd for ${member.id}`,
                    })
                }

                return output
            },
            { context: { guild: id, settings } }
        )

        for (let index = 0; index < result.length; index++) {
            for (let i = 0; i < result.length; i++) {
                logger.info(result[index][i])
            }
        }

        logger.info({
            labels: { command: 'forceguildscan', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} (${interaction?.user?.id}) forcefully ran a scan on ${id}`,
        })

        return sendSuccess(interaction, 'Successfully ran')
    },
})
