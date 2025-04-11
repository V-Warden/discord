import { ApplicationCommandType } from 'discord.js'
import { ContextMenu } from '../../structures/ContextMenu'
import { sendError, sendSuccess } from '../../utils/messages'
import { UserStatus } from '@prisma/client'
import actionAppeal from '../../utils/actioning/actionAppeal'
import db from '../../utils/database'
import logger from '../../utils/logger'

export default new ContextMenu({
    name: 'Appeal User',
    type: ApplicationCommandType.User,
    main: true,
    defaultMemberPermissions: 'Administrator',
    run: async ({ interaction, client }) => {
        const id = interaction.targetId
        const member = await client.users.fetch(id).catch(() => null)

        const user = await db.getUser(id)

        if (user?.status === 'APPEALED')
            return sendError(interaction, 'That user has no new servers to appeal')

        let firstAppeal
        if (user?.appealedFirst) {
            firstAppeal = new Date(user?.appealedFirst)
        } else {
            firstAppeal = new Date()
        }

        const appealPromise = db.appealImports(id)
        const updatePromise = db.updateUser(id, {
            status: UserStatus.APPEALED,
            appealedFirst: firstAppeal,
            appealedLast: new Date(),
            appeals: {
                increment: 1,
            },
        })
        await Promise.all([appealPromise, updatePromise])

        sendSuccess(interaction, `Successfully appealed <@${id}> (${id})`, false)

        logger.info({
            labels: { command: 'appeal', userId: interaction?.user?.id, userTag: interaction?.user?.tag, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} (${interaction?.user?.id}) appealed ${member?.tag} (${id})`,
        })

        await db.increaseAppealsStaff(interaction.user.id)

        return actionAppeal(client, id)
    },
})
