import { ApplicationCommandOptionType, ChannelType, TextChannel } from 'discord.js'
import { Command } from '../../structures/Command'
import { sendError, sendSuccess } from '../../utils/messages'
import db from '../../utils/database'
import logger from '../../utils/logger'

export default new Command({
    name: 'fixguild',
    description: 'replies with pong',
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

        const guild = await client.guilds.fetch(id).catch(e => {
            logger.error({
                labels: { command: 'fixguild', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: e instanceof Error ? e.message : JSON.stringify(e),
            })
        })
        if (!guild) return sendError(interaction, 'Invalid guild id provided')

        await guild.channels.fetch().catch(e => {
            logger.error({
                labels: { command: 'fixguild', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: e instanceof Error ? e.message : JSON.stringify(e),
            })
        })
        const channel = guild.channels.cache
            .filter(chan => chan?.type === ChannelType.GuildText)
            .first() as TextChannel
        if (!channel) return sendError(interaction, 'Unable to find a channel in guild')

        await db.createGuild({
            id: guild.id,
            name: guild.name,
            logChannel: channel.id,
            punishments: {
                create: {},
            },
        })

        logger.info({
            labels: { command: 'fixguild', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} (${interaction?.user?.id}) successfully created guild ${guild.name} (${guild.id})`,
        })

        return sendSuccess(interaction, `Successfully created guild ${guild.name} (${guild.id})`)
    },
})
