import { TextChannel } from 'discord.js'
import { Colours } from '../../@types/Colours'
import { Command } from '../../structures/Command'
import actionUser from '../../utils/actioning/actionUser'
import logger from '../../utils/logger'
import { sendError, sendSuccess } from '../../utils/messages'
import sendEmbed from '../../utils/messages/sendEmbed'
import db from '../../utils/database'
import { chunkArray } from '../../utils/misc'
import { Users } from '@prisma/client'

const cooldowns = new Map<string, number>()
const COOLDOWN_TIME = 30 * 60 * 1000

export default new Command({
    name: 'scanusers',
    description: 'Initiates a guild scan',
    defaultMemberPermissions: 'Administrator',
    run: async ({ interaction, client }) => {
        if (!interaction.guild) return sendError(interaction, 'Must be used in a guild')

        const guildId = interaction.guild.id
        const now = Date.now()
        const cooldown = cooldowns.get(guildId)

        if (cooldown && now < cooldown) {
            const remainingTime = Math.ceil((cooldown - now) / 1000 / 60)
            return sendError(interaction, `You can use this command again in ${remainingTime} minutes`)
        }

        cooldowns.set(guildId, now + COOLDOWN_TIME)

        const guild = await client.guilds.fetch(interaction.guild.id).catch(e => {
            logger.error({
                labels: { command: 'scanusers', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: e instanceof Error ? e.message : JSON.stringify(e),
            })
            return undefined
        })

        if (!guild) return sendError(interaction, 'Failed to fetch guild')

        const settings = await db.getGuild(
            { id: interaction.guild.id },
            { punishments: true, logChannel: true }
        )
        if (!settings) return sendError(interaction, 'Unable to find guild in database')
        if (!settings?.punishments?.enabled) return sendError(interaction, 'Punishments are not enabled')

        await guild.members.fetch().then(async members => {
            const memberMap = members.filter(x => !x.user.bot).map(x => x.id)

            // Instead of querying all IDs at once, we'll chunk them into 20,000
            const chunkedMemberMap = chunkArray(memberMap, 20000)
            let users: Users[] = []

            for (const chunk of chunkedMemberMap) {
                try {
                    const chunkUsers = await db.getManyUsers({
                        id: { in: chunk },
                        status: { in: settings?.punishments?.banAppeal ? ['APPEALED', 'BLACKLISTED', 'PERM_BLACKLISTED'] : ['BLACKLISTED', 'PERM_BLACKLISTED'] },
                    })
                    users = [...users, ...chunkUsers]
                } catch (e) {
                    logger.error({
                        labels: { command: 'scanusers', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: `Error fetching users batch: ${e instanceof Error ? e.message : JSON.stringify(e)}`,
                    })
                }
            }

            if (users.length === 0)
                return sendSuccess(interaction, 'Scanning has complete, no users blacklisted')

            if (!settings?.punishments) return sendError(interaction, 'No punishments set for this guild')
            if (!settings.logChannel) return sendError(interaction, 'Must have a log channel set')

            sendSuccess(interaction, 'Scanning..\n> This may take a while due to Discords rate limit')

            let actioned = 0

            for (let index = 0; index < users.length; index++) {
                const user = users[index]
                const result = await actionUser(
                    client,
                    guild,
                    settings.logChannel,
                    settings?.punishments,
                    user
                ).catch(e => {
                    logger.error({
                        labels: { command: 'scanusers', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                })
                if (result) actioned += 1
            }

            logger.info({
                labels: { command: 'scanusers', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: `${interaction?.user?.tag} (${interaction?.user?.id}) has initiated a scan with a total of ${memberMap.length} members, ${actioned} blacklisted users have been actioned accordingly`,
            })

            sendEmbed({
                channel: interaction.channel as TextChannel,
                embed: {
                    description: `Scanning has completed, \`${actioned}\` are blacklisted and have been actioned accordingly`,
                    color: Colours.GREEN,
                },
            })

            return true
        }).catch(e => {
            logger.error({
                labels: { command: 'scanusers', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: e instanceof Error ? e.message : JSON.stringify(e),
            })

            return sendError(interaction, 'Failed to fetch members')
        })

        return false
    },
})
