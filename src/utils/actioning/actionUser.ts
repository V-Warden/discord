import { all } from 'axios'
import { Client, Guild, TextChannel, PermissionsBitField } from 'discord.js'
import { Colours } from '../../@types/Colours'
import { generateErrorID } from '../../utils/misc'
import { getPunishment, convertServersTypeToUsersType } from './utils'
import { Punish, Punishments, Users } from '@prisma/client'
import { UserType } from '@prisma/client'
import actionAppeal from './actionAppeal'
import db from '../database'
import logger, { logException } from '../logger'
import queueActionSend from '../queues/queueActionSend'
import sendEmbed from '../messages/sendEmbed'

/**
 * Actions a user on a specific guild
 * @param guild
 * @param logChannel channel to send logs to
 * @param punishments guild punishments
 * @param user
 */
export default async function actionUser(
    client: Client,
    guild: Guild,
    logChannel: string,
    punishments: Punishments,
    user: Users
) {
    const member = await guild.members.fetch(user.id)
    if (!member) return false
    if (member.user.bot) return false

    const importsPromise = db.getImports(user.id)
    const allImportsPromise = db.getAllImports(user.id)
    const appealedImportsPromise = db.getAppealedImports(user.id)

    const [imports, allImports, appealedImports] = await Promise.all([importsPromise, allImportsPromise, appealedImportsPromise])

    if (allImports.length === 0) {
        await actionAppeal(client, user.id)
        await db.deleteUser(user.id)
        return false
    }

    if (!punishments.banAppeal) {
        if (user.status === 'BLACKLISTED' && user.reason === 'Unspecified' && allImports.length === appealedImports.length) {
            await db.updateUser(user.id, { status: 'APPEALED', appeals: { increment: 1 } })
            await actionAppeal(client, user.id)
            return false
        }
    }

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
        logger.error({
            labels: { action: 'actionUser', userId: user.id, guildId: member.guild.id },
            message: e instanceof Error ? e.message : JSON.stringify(e),
        })
        return false
    }

    let BadServersType: string[] = []
    if (allImports.length > 0) {
        allImports.map((x) => {
            if (x?.BadServer && x?.BadServer?.type) BadServersType.push(x.BadServer.type)
        })
    }

    const serversTypeToUsersType = convertServersTypeToUsersType(BadServersType)

    if (user.status === 'APPEALED' && punishments.banAppeal) {
        /*
        * Check if appealed user should be punished
        * @param user - User
        * @param punishments - Guild punishments
        * @param BadServersType - Array of server types
        * @returns boolean
        */
        const checkAppealedUser = (user: Users, punishments: Punishments, BadServersType: any[]): boolean => {
            const shouldUnbanType = (type: UserType) => {
                if (type === 'OTHER' && punishments.other === Punish.BAN && punishments.unbanOther === false) {
                    return false
                } else if (type === 'LEAKER' && punishments.leaker === Punish.BAN && punishments.unbanLeaker === false) {
                    return false
                } else if (type === 'CHEATER' && punishments.cheater === Punish.BAN && punishments.unbanCheater === false) {
                    return false
                } else if (type === 'SUPPORTER' && punishments.supporter === Punish.BAN && punishments.unbanSupporter === false) {
                    return false
                } else if (type === 'OWNER' && punishments.owner === Punish.BAN && punishments.unbanOwner === false) {
                    return false
                }
                return true
            }

            // If global unban is enabled, check specific type unban settings
            if (punishments.unban) {
                // If any specific type unban setting is false, the user should be punished
                if (!shouldUnbanType(user.type)) {
                    return true
                }

                for (const type of BadServersType) {
                    if (!shouldUnbanType(type as UserType)) {
                        return true
                    }
                }

                // If all specific type unban settings are true, the user should not be punished
                return false
            }

            // If global unban is not enabled, check specific type unban settings
            if (!shouldUnbanType(user.type)) {
                return true
            }

            for (const type of BadServersType) {
                if (!shouldUnbanType(type as UserType)) {
                    return true
                }
            }

            // If none of the conditions for unbanning are met, the user should be punished
            return false
        }

        const shouldPunish = checkAppealedUser(user, punishments, serversTypeToUsersType)
        if (!shouldPunish) {
            return false
        }
    }

    const toDo: any = getPunishment(user.type, punishments, serversTypeToUsersType)

    let channel: TextChannel
    try {
        channel = (await guild.channels.fetch(logChannel ?? '')) as TextChannel
    } catch {
        return false
    }

    if (!channel) return false

    await queueActionSend(user.id, member.guild.id, toDo).catch(e => {
        const errorId = generateErrorID()
        logger.error({
            labels: { action: 'actionUser', guildId: member.guild.id },
            message: e instanceof Error ? e.message : JSON.stringify(e),
        })

        sendEmbed({
            channel,
            embed: {
                description: `\`🔴\` An unexpected error has occured\n> Error ID: \`${errorId}\`\n> Please report this in the [Warden Discord](https://discord.gg/MVNZR73Ghf)`,
                color: Colours.RED,
            },
        })
    })

    if (toDo === 'WARN') {
        logger.info({
            labels: { action: 'actionUser', userId: user.id, guildId: member.guild.id },
            message: `${member.user.username} (${user.id}) was seen in ${member.guild.name} (${member.guild.id}) and has been queued for a direct message`,
        })

        sendEmbed({
            channel,
            embed: {
                description: `:warning: User <@${member.id}> has been seen in ${realCount == 0 ? 1 : realCount} bad discord servers.\n**User Status**: ${user.status.toLowerCase()} / **User Type**: ${user.type.toLowerCase()}`,
                color: Colours.GREEN,
            },
        })

        return true
    } else if (toDo === 'ROLE') {
        try {
            if (!punishments.roleId) throw new Error('Invalid role id set')
            const oldRoles = member.roles.cache.map(x => x.id).join(',')

            const hasBlacklistedAlready = member.roles.cache.find(x => x.id === punishments.roleId)
            if (hasBlacklistedAlready) return false

            // Get managed roles (linked roles)
            const managedRoles = member.roles.cache.filter(role => role.managed).map(role => role.id)

            // Combine the new role with the managed roles
            const newRoles = [...managedRoles, punishments.roleId]

            // Set the new roles
            await member.roles.set(newRoles)

            await db.createArchiveRole({
                id: member.id,
                roles: oldRoles,
                Guild: { connect: { id: punishments.id } },
            })

            logger.info({
                labels: { action: 'actionUser', guildId: member.guild.id },
                message: `${member.user.username} (${user.id}) was seen in ${member.guild.name} (${member.guild.id}) has been given the role ${punishments.roleId} and has been queued for a direct message`,
            })

            sendEmbed({
                channel,
                embed: {
                    description: `:shield: User <@${member.id}> has been punished with a ROLE.\nThey have been seen in ${realCount == 0 ? 1 : realCount} bad discord servers.\n**User Status**: ${user.status.toLowerCase()}`,
                    color: Colours.GREEN,
                },
            })

            return true
        } catch (e: any) {
            const errorId = await logException(null, e)
            const botRole = await guild?.members?.me?.roles?.highest.position
            const memRole = await member?.roles?.highest.position
            if (typeof botRole === 'undefined' || typeof memRole === 'undefined' || typeof punishments.roleId === 'undefined') return
            const botCanMan = await guild?.members?.me?.permissions?.has(PermissionsBitField?.Flags.ManageRoles)
            if (typeof botCanMan === 'boolean' && typeof botRole == 'number' && typeof memRole == 'number') {
                sendEmbed({
                    channel,
                    embed: {
                        description: `I tried to remove this user's role and set them to \`${punishments.roleId}\`, however I encountered an error. \n> Debug: ${botRole} - ${memRole} - ${botCanMan}\n> Error ID: ${errorId}`,
                        color: Colours.RED,
                    },
                })
            } else {
                sendEmbed({
                    channel,
                    embed: {
                        description: `I tried to remove this user's role and set them to \`${punishments.roleId}\`, however I encountered an error. \n> Error ID: ${errorId}`,
                        color: Colours.RED,
                    },
                })
            }
            return false
        }
    } else if (toDo === 'KICK' || toDo === 'BAN') {
        logger.info({
            labels: { action: 'actionUser', guildId: member.guild.id },
            message: `${member.user.username} (${user.id}) was seen in ${member.guild.name} (${member.guild.id}) and has been queued for a ${toDo} and direct message`,
        })

        if (punishments.roleId) {
            const hasBlacklistedAlready = member.roles.cache.find(x => x.id === punishments.roleId)
            if (hasBlacklistedAlready) return false

            // Get managed roles (linked roles)
            const managedRoles = member.roles.cache.filter(role => role.managed).map(role => role.id)

            // Combine the new role with the managed roles
            const newRoles = [...managedRoles, punishments.roleId]

            // Set the new roles
            await member.roles.set(newRoles)

            sendEmbed({
                channel,
                embed: {
                    description: `:shield: User <@${member.id}> has been seen in ${realCount == 0 ? 1 : realCount} bad discord servers and has been queued for a ${toDo}.\n**User Status**: ${user.status.toLowerCase()}`,
                    color: Colours.YELLOW,
                },
            })

            return true
        } else {
            sendEmbed({
                channel,
                embed: {
                    description: `:shield: User <@${member.id}> has been seen in ${realCount == 0 ? 1 : realCount} bad discord servers and has been queued for a ${toDo}.\n**User Status**: ${user.status.toLowerCase()}\n\nPlease configure a punishment role through Warden to prevent interactions until the action is completed.`,
                    color: Colours.YELLOW,
                },
            })

            return true
        }
    }

    return true
}
