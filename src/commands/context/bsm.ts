import { ApplicationCommandType, Invite, MessageContextMenuCommandInteraction } from 'discord.js'
import { ContextMenu } from '../../structures/ContextMenu'
import { sendError, sendSuccess } from '../../utils/messages'
import { ServerType, BadServers } from '@prisma/client'
import db from '../../utils/database'
import logger from '../../utils/logger'

export default new ContextMenu({
    name: 'Blacklist Server',
    type: ApplicationCommandType.Message,
    main: true,
    defaultMemberPermissions: 'Administrator',
    run: async ({ interaction, client }) => {
        interaction = interaction as MessageContextMenuCommandInteraction

        const split = interaction.targetMessage.content.split(' / ')

        const invite = split[0].replaceAll(' ', '')
        const type = split[1].replaceAll(' ', '').toUpperCase() as ServerType
        const reason = split[2]
        let server: Invite | undefined
        try {
            server = await client.isValidInvite(invite)
        } catch (e) {
            logger.error({
                labels: { command: 'bsm', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: e instanceof Error ? e.message : JSON.stringify(e),
            })
        }

        if (!server?.guild) return sendError(interaction, 'Unknown Server')

        const exists: BadServers | null = await db.getBadServer({ id: server.guild?.id })
        if (exists) {
            if (exists?.name === server.guild?.name)
                return sendError(interaction, 'Server is already blacklisted')

            const newOldNames = exists?.oldNames ? exists.oldNames.split('<>') : []
            newOldNames.push(exists?.name)
            await db.updateBadServer(server.guild?.id, {
                name: server.guild?.name,
                oldNames: newOldNames.join('<>'),
                invite,
            })

            return sendError(
                interaction,
                `This server already exists but under a new name, I have automatically updated this. \`\`\`New Name: ${server.guild?.name}\nOld Name: ${exists.name}\`\`\``
            )
        } else {
            await db.createBadServer({
                id: server.guild?.id,
                name: server.guild?.name,
                type,
                invite,
                reason,
                staff: {
                    connectOrCreate: {
                        where: {
                            id: interaction.user.id,
                        },
                        create: {
                            id: interaction.user.id,
                            role: 'ADMIN',
                        },
                    },
                },
            })

            logger.info({
                labels: { command: 'bsm', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: `${interaction?.user?.tag} (${interaction?.user?.id}) blacklisted server ${server.guild.name} (${server.guild.id}) as type ${type}`,
            })

            return sendSuccess(
                interaction,
                `Successfully added bad server ${server.guild.name} (${server.guild.id}) as type ${type}`,
                false
            )
        }
    },
})
