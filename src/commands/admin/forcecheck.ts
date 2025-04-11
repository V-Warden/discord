import { ApplicationCommandOptionType } from 'discord.js'
import { Command } from '../../structures/Command'
import { sendError, sendSuccess } from '../../utils/messages'
import actionUserGlobal from '../../utils/actioning/actionUserGlobal'
import db from '../../utils/database'
import logger from '../../utils/logger'

export default new Command({
    name: 'forcecheck',
    description: 'Globally check a user',
    main: true,
    defaultMemberPermissions: 'Administrator',
    options: [
        {
            type: ApplicationCommandOptionType.User,
            name: 'user',
            description: 'User or ID',
            required: true,
        },
    ],
    run: async ({ interaction, client }) => {
        const member = interaction.options.getUser('user')
        const id = member?.id as string
        if (!id) return sendError(interaction, 'Invalid user or id provided')

        const user = await db.getUser(id)

        if (!user) return sendError(interaction, 'User not found in database')
        if (user.status === 'WHITELISTED')
            return sendError(interaction, 'You cannot action a whitelisted user')
        if (user.status === 'APPEALED') return sendError(interaction, 'You cannot action an appealed user..')
        if (user.type === 'BOT') return sendError(interaction, 'You cannot action a bot user')

        sendSuccess(interaction, 'Requested force check on all shards')
        await actionUserGlobal(client, id).catch(e => {
            logger.error({
                labels: { command: 'forcecheck', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: e instanceof Error ? e.message : JSON.stringify(e),
            })
        })

        logger.info({
            labels: { command: 'forcecheck', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} (${interaction?.user?.id}) successfully force checked ${member?.tag} (${id})`,
        })

        sendSuccess(interaction, 'Force check successfully completed')

        return false
    },
})
