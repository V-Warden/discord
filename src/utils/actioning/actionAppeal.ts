import db from '../database'
import { Client, Guild, GuildBan, GuildMember } from 'discord.js'
import logger from '../logger'
import { Bans, Roles } from '@prisma/client'
import { convertServersTypeToUsersType } from './utils'

/**
 * Removes roles/bans for user on appeal
 * @param client Client
 * @param id User ID
 */
export default async function (c: Client, id: string): Promise<boolean> {
    if (!c.shard) {
        logger.warn({
            labels: { action: 'actionAppeal', userId: id },
            message: 'No shards online, unable to action appeal',
        })
        return false
    }

    const bansPromise = db.getAllBans({
        id,
        Guild: { punishments: { unban: true, enabled: true } },
    })

    const rolesPromise = db.getAllRoles({ id })

    const [bans, roles] = await Promise.all([bansPromise, rolesPromise])

    const servers = await Promise.all(bans.map(async (ban) => {
        const settings = await db.getGuild({ id: ban.guild }, { punishments: true })
        return { guild: ban.guild, settings }
    }))

    let allUserTypes = [] as string[]
    for (let index = 0; index < servers.length; index++) {
        const element = servers[index]

        if (!element.settings?.punishments?.unbanOther ||
            !element.settings?.punishments?.unbanLeaker ||
            !element.settings?.punishments?.unbanCheater ||
            !element.settings?.punishments?.unbanSupporter ||
            !element.settings?.punishments?.unbanOwner) {
            const allImportsPromise = db.getAllImports(id)
            const [allImports] = await Promise.all([allImportsPromise])
            const getUser = await db.getUser(id)
            allUserTypes = getUser ? [getUser.type] : []

            if (allImports.length > 0) {
                let BadServersType: string[] = []
                if (allImports.length > 0) {
                    allImports.map((x) => {
                        if (x?.BadServer && x?.BadServer?.type) BadServersType.push(x.BadServer.type)
                    })
                }

                const serversTypeToUsersType = convertServersTypeToUsersType(BadServersType)

                allUserTypes = [...allUserTypes, ...serversTypeToUsersType]
            }
        }
    }

    const result = await c.shard.broadcastEval(
        async (client, { id, bans, roles, servers, allUserTypes }) => {
            const output = []

            await client.guilds.fetch().catch(e => {
                output.push({
                    labels: { action: 'actionAppeal' },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                })
            })

            const guilds = client.guilds.cache.map(x => x.id)
            const guildBans: Bans[] = bans.filter(x => guilds.some(a => a === x.guild))
            const guildRoles: Roles[] = roles.filter(x => guilds.some(a => a === x.guild))

            if (!guildBans && !guildRoles) {
                output.push({
                    labels: { action: 'actionAppeal', userId: id },
                    message: `No bans or roles found for ${id} on this shard`,
                })

                return output
            }

            if (guildBans.length > 0) {
                for (let index = 0; index < guildBans.length; index++) {
                    const element = guildBans[index]
                    try {
                        const guild: Guild = await client.guilds.fetch(element.guild)
                        const settings = servers.find(x => x.guild === element.guild)?.settings

                        if (!settings?.punishments?.unbanOther && allUserTypes.includes('OTHER')) {
                            output.push({
                                labels: { action: 'actionAppeal', userId: element.id, guildId: guild.id },
                                message: `User ${element.id} is type Other and is disallowed from being unbanned in ${guild.name} (${guild.id})`,
                            })
                            continue
                        }
                        if (!settings?.punishments?.unbanLeaker && allUserTypes.includes('LEAKER')) {
                            output.push({
                                labels: { action: 'actionAppeal', userId: element.id, guildId: guild.id },
                                message: `User ${element.id} is type Leaker and is disallowed from being unbanned in ${guild.name} (${guild.id})`,
                            })
                            continue
                        }
                        if (!settings?.punishments?.unbanCheater && allUserTypes.includes('CHEATER')) {
                            output.push({
                                labels: { action: 'actionAppeal', userId: element.id, guildId: guild.id },
                                message: `User ${element.id} is type Cheater and is disallowed from being unbanned in ${guild.name} (${guild.id})`,
                            })
                            continue
                        }
                        if (!settings?.punishments?.unbanSupporter && allUserTypes.includes('SUPPORTER')) {
                            output.push({
                                labels: { action: 'actionAppeal', userId: element.id, guildId: guild.id },
                                message: `User ${element.id} is type Supporter and is disallowed from being unbanned in ${guild.name} (${guild.id})`,
                            })
                            continue
                        }
                        if (!settings?.punishments?.unbanOwner && allUserTypes.includes('OWNER')) {
                            output.push({
                                labels: { action: 'actionAppeal', userId: element.id, guildId: guild.id },
                                message: `User ${element.id} is type Owner and is disallowed from being unbanned in ${guild.name} (${guild.id})`,
                            })
                            continue
                        }

                        const ban: GuildBan = await guild.bans.fetch({ user: element.id, force: true })

                        if (!ban.reason?.includes('Warden - User Type')) continue

                        await guild.bans.remove(element.id)

                        output.push({
                            labels: { action: 'actionAppeal', guildId: guild.id },
                            message: `Unbanned ${element.id} from ${guild.name} (${guild.id})`,
                        })
                    } catch (e) {
                        output.push({
                            labels: { action: 'actionAppeal', userId: id, guildId: element.guild },
                            message: e instanceof Error ? e.message : JSON.stringify(e),
                        })
                    }
                }
            } else {
                output.push({
                    labels: { action: 'actionAppeal', userId: id },
                    message: `No bans found in database for user ${id}`,
                })
            }

            if (guildRoles.length > 0) {
                for (let index = 0; index < guildRoles.length; index++) {
                    const element = guildRoles[index]
                    try {
                        const guild: Guild = await client.guilds.fetch(element.guild)
                        const member: GuildMember = await guild.members.fetch(element.id)
                        const managedRoles = member.roles.cache.filter(role => role.managed).map(role => role.id)
                        const returnRoles = element.roles.split(',')
                        const uniqueRoles = new Set([...returnRoles, ...managedRoles])

                        await member.roles.set([...uniqueRoles])

                        output.push({
                            labels: { action: 'actionAppeal', userId: id, guildId: guild.id },
                            message: `Give roles back to ${id} in ${guild.name} (${guild.id})`,
                        })
                    } catch (e) {
                        output.push({
                            labels: { action: 'actionAppeal', userId: id, guildId: element.guild },
                            message: e instanceof Error ? e.message : JSON.stringify(e),
                        })
                    }
                }
            } else {
                output.push({
                    labels: { action: 'actionAppeal', userId: id },
                    message: `No roles found in database for user ${id}`,
                })
            }

            return output
        },
        { context: { id: id, bans: bans, roles: roles, servers: servers, allUserTypes: allUserTypes } }
    )

    if (result.length > 0) {
        for (let index = 0; index < result.length; index++) {
            const element = result[index]
            if (element.length > 0) {
                for (let index = 0; index < element.length; index++) {
                    const log = element[index]
                    logger.info(log)
                }
            }
        }
    }

    const removeBansPromise = db.removeAllBans({ id })
    const removeRolesPromise = db.removeAllRoles({ id })

    await Promise.all([removeBansPromise, removeRolesPromise])

    return true
}
