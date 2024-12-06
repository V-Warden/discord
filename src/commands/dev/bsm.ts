import { ApplicationCommandOptionType, Invite } from 'discord.js'
import { BadServers, ServerType, UserStatus } from '@prisma/client'
import { Command } from '../../structures/Command'
import { sendError, sendSuccess } from '../../utils/messages'
import actionAppeal from '../../utils/actioning/actionAppeal'
import db from '../../utils/database'
import logger from '../../utils/logger'

export default new Command({
    name: 'bsm',
    description: 'Bad Servers Management',
    main: true,
    defaultMemberPermissions: 'Administrator',
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'add',
            description: 'Add a bad server',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'invite',
                    description: 'Server Invite',
                    required: true,
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'type',
                    description: 'Server Type',
                    choices: [
                        {
                            name: 'Cheating',
                            value: 'CHEATING',
                        },
                        {
                            name: 'Leaking',
                            value: 'LEAKING',
                        },
                        {
                            name: 'Reselling',
                            value: 'RESELLING',
                        },
                        {
                            name: 'Advertising',
                            value: 'ADVERTISING',
                        },
                    ],
                    required: true,
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'reason',
                    description: 'Reason',
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'remove',
            description: 'Remove a bad server',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'id',
                    description: 'Server ID',
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'update',
            description: 'Update a bad server',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'id',
                    description: 'Server ID',
                    required: true,
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'invite',
                    description: 'Server Invite',
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'type',
                    description: 'Server Type',
                    choices: [
                        {
                            name: 'Cheating',
                            value: 'CHEATING',
                        },
                        {
                            name: 'Leaking',
                            value: 'LEAKING',
                        },
                        {
                            name: 'Reselling',
                            value: 'RESELLING',
                        },
                        {
                            name: 'Advertising',
                            value: 'ADVERTISING',
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'reason',
                    description: 'Reason',
                },
            ],
        },
    ],
    run: async ({ interaction, client }) => {
        const name = interaction.options.data[0]?.name as string
        if (!name) return sendError(interaction, 'Sub command must be provided')

        if (name === 'add') {
            const invite = interaction.options.get('invite')?.value as string
            const type = interaction.options.get('type')?.value as ServerType
            const reason = interaction.options.get('reason')?.value as string
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

                return sendSuccess(
                    interaction,
                    `Successfully added \`${server.guild.id}\` - \`${server.guild.name}\` as a \`${type}\` bad server`
                )
            }
        } else if (name === 'remove') {
            const serverId = interaction.options.get('id')?.value as string

            const exists = await db.getBadServer({ id: serverId })
            if (!exists) return sendError(interaction, 'That ID is not a bad server')

            const users = await db.getAllImportsByBadServer(serverId)
            if (!users) return

            sendSuccess(
                interaction,
                'Successfully removed as a bad server\n> Removing all imports and appealing where needed, this may take some time'
            )
            for (let index = 0; index < users.length; index++) {
                const user = users[index]
                const { User } = user
                if (User.servers.length === 1) {
                    // appeal user and delete user
                    const appealPromise = db.appealImports(User.id)
                    const updatePromise = db.updateUser(User.id, {
                        status: UserStatus.APPEALED,
                        appeals: {
                            increment: 1,
                        },
                    })
                    await Promise.all([appealPromise, updatePromise])
                    await actionAppeal(client, User.id).catch(e => {
                        logger.error({
                            labels: { command: 'bsm', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                            message: e instanceof Error ? e.message : JSON.stringify(e),
                        })
                    })
                    await db.deleteUser(User.id)
                } else {
                    const unappealedImports = await db.countUnappealedImports(User.id)
                    for (let i = 0; i < User.servers.length; i++) {
                        const server = User.servers[i]
                        if (server.id === serverId) {
                            if (server.appealed) continue
                            if (unappealedImports === 1) {
                                const appealPromise = db.appealImports(User.id)
                                const updatePromise = db.updateUser(User.id, {
                                    status: UserStatus.APPEALED,
                                    appeals: {
                                        increment: 1,
                                    },
                                })
                                await Promise.all([appealPromise, updatePromise])
                                await actionAppeal(client, User.id).catch(e => {
                                    logger.error({
                                        labels: { command: 'bsm', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                        message: e instanceof Error ? e.message : JSON.stringify(e),
                                    })
                                })
                            } else {
                                await db.appealSpecificImport(User.id, serverId)
                            }
                        }
                    }
                }
            }

            await db.deleteBadServer(serverId)

            logger.info({
                labels: { command: 'bsm', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: `${interaction?.user?.tag} (${interaction?.user?.id}) removed ${serverId}`,
            })

            return true
        } else if (name === 'update') {
            const serverId = interaction.options.get('id')?.value as string
            const invite = interaction.options.get('invite')?.value as string
            const type = interaction.options.get('type')?.value as ServerType
            const reason = interaction.options.get('reason')?.value as string

            const exists = await db.getBadServer({ id: serverId })
            if (!exists) return sendError(interaction, 'That ID is not a bad server')

            if (invite) {
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

                await db.updateBadServer(serverId, {
                    name: server.guild?.name,
                    invite,
                })
            }

            if (type) {
                await db.updateBadServer(serverId, {
                    type,
                })
            }

            if (reason) {
                await db.updateBadServer(serverId, {
                    reason,
                })
            }

            logger.info({
                labels: { command: 'bsm', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: `${interaction?.user?.tag} (${interaction?.user?.id}) updated ${serverId} with${invite ? ` invite ${invite}` : ''}${type ? ` type ${type}` : ''}${reason ? ` reason ${reason}` : ''}`,
            })

            return sendSuccess(interaction, `Successfully updated ${serverId} with${invite ? ` invite ${invite}` : ''}${type ? ` type ${type}` : ''}${reason ? ` reason ${reason}` : ''}`)
        } else return sendError(interaction, 'Invalid sub command')
    },
})
