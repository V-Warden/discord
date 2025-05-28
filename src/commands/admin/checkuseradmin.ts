import { APIEmbed, ApplicationCommandOptionType } from 'discord.js'
import { capitalize, uploadText } from '../../utils/misc'
import { chunk } from 'lodash'
import { Colours } from '../../@types/Colours'
import { Command } from '../../structures/Command'
import { sendSuccess, sendWarning, sendError } from '../../utils/messages'
import { UserType } from '@prisma/client'
import actionAppeal from '../../utils/actioning/actionAppeal'
import db from '../../utils/database'
import logger from '../../utils/logger'
import sendEmbed from '../../utils/messages/sendEmbed'
import sendPagination from '../../utils/messages/sendPagination'

export default new Command({
    name: 'checkuseradmin',
    description: 'Check user database status as an admin',
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

        const user = await db.getUser(id)
        if (!user) return sendSuccess(interaction, 'User not found in database')
        const [noteCount, imports, history] = await Promise.all([
            db.countNotes(id),
            db.getImports(id),
            db.getHistory(id),
        ])

        let historyResponse
        if (history.length > 0) {
            historyResponse = await uploadText(JSON.stringify(history, null, 4)).catch(e => {
                logger.error({
                    labels: { command: 'checkuseradmin', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                })
            })
        } else {
            historyResponse = 'No prior history'
        }

        if (!historyResponse) return sendError(interaction, 'Failed to upload history')

        if (user.status === 'APPEALED') {
            let comments = `User has no outstanding servers to be appealed for\n\n> History: <${historyResponse}>\n> Notes: ${noteCount}`
            let firstAppeal = ''
            let lastAppeal = ''

            if (user.appealedFirst) {
                const createdAtTimestamp = Math.floor(new Date(user.appealedFirst).getTime() / 1000)
                comments += `\n> First Appeal: <t:${createdAtTimestamp}:D>`
            }
            if (user.appealedLast) {
                const createdAtTimestamp = Math.floor(new Date(user.appealedLast).getTime() / 1000)
                if (firstAppeal !== lastAppeal) {
                    comments += `\n> Last Appeal: <t:${createdAtTimestamp}:D>`
                }
            }

            return sendSuccess(
                interaction,
                comments
            )
        }

        const allImportsPromise = db.getAllImports(user.id)
        const appealedImportsPromise = db.getAppealedImports(user.id)

        const [allImports, appealedImports] = await Promise.all([allImportsPromise, appealedImportsPromise])

        if (
            (user.status === 'BLACKLISTED' &&
                user.reason === 'Unspecified' &&
                allImports.length === appealedImports.length) ||
            allImports.length === 0
        ) {
            await db.updateUser(user.id, { status: 'APPEALED', appeals: { increment: 1 } })
            await actionAppeal(client, user.id).catch(e => {
                logger.error({
                    labels: { command: 'checkuseradmin', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                })
            })

            if (allImports.length === 0) await db.deleteUser(user.id)

            return sendWarning(
                interaction,
                `User is apart of a unblacklisted server, correcting status and appealing\n\n> History: <${historyResponse}>\n> Notes: ${noteCount}`
            )
        }

        const value = []
        let realCount = 0

        for (let i = 0, l = imports.length; i < l; ++i) {
            const x = imports[i]
            if (x.roles.includes('"servers":')) {
                const parsed = JSON.parse(x.roles)
                const servers = parsed['servers'].split(';')

                const badServers = await db.getBadServers(servers)
                realCount += servers.length

                const names = badServers.map(x => x.name)
                const roles = parsed['roles'].split(';')
                const newData = [{ names, roles }]

                const response = await uploadText(JSON.stringify(newData, null, 4)).catch(e => {
                    logger.error({
                        labels: { command: 'checkuseradmin', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                })

                if (!response) return sendError(interaction, 'Failed to upload legacy data')

                value.push(`Legacy Data\n> View data: <${response}>\n`)
            } else {
                realCount += 1
                const dateFirst = new Date(x.createdAt)
                const dateFirstTimestamp = Math.floor(new Date(x.createdAt).getTime() / 1000)
                const dateLast = new Date(x.updatedAt)
                const dateLastTimestamp = Math.floor(new Date(x.updatedAt).getTime() / 1000)
                const formattedRoles = x.roles.split(',').map(role => role.trim())
                const firstSeen = `> First seen: <t:${dateFirstTimestamp}:D>`
                const lastSeen = dateFirst.toLocaleDateString() !== dateLast.toLocaleDateString() ? `\n> Last seen: <t:${dateLastTimestamp}:D>` : ''

                if (x.roles.length > 200) {
                    const response = await uploadText(JSON.stringify(formattedRoles, null, 4)).catch(e => {
                        logger.error({
                            labels: { command: 'checkuseradmin', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                            message: e instanceof Error ? e.message : JSON.stringify(e),
                        })
                    })

                    value.push(
                        `${x.BadServer.name}\n> Type: ${x.type} \n> Roles: <${response}>\n${firstSeen}${lastSeen}\n`
                    )
                } else {
                    value.push(
                        `${x.BadServer.name}\n> Type: ${x.type} \n> Roles: ${x.roles.split(';').join(', ')}\n${firstSeen}${lastSeen}\n`
                    )
                }
            }
        }
        const mainEmbed = {
            title: ':shield: User In Database',
            thumbnail: { url: '' },
            description: `<@${user.id}> has been seen in ${realCount} bad Discord servers.`,
            color: Colours.BLUE,
        }

        const types: UserType[] = imports.map(x => x.type)
        types.push(user.type)
        const highestType = db.findHighestType(types)
        let comments = `> ID: ${user.id}\n> Status: ${capitalize(user.status)}\n`

        if (user.status === 'PERM_BLACKLISTED' && user.reason && user.reason !== 'Unspecified') {
            comments += `> Reason: ${user.reason}\n`
        }

        comments += `> Type: ${capitalize(highestType)}\n> History: ${historyResponse}\n> Notes: ${noteCount}\n> Appeals: ${user.appeals}`

        let firstAppeal = ''
        let lastAppeal = ''

        if (user.appealedFirst) {
            const firstAppealTimestamp = Math.floor(new Date(user.appealedFirst).getTime() / 1000)
            firstAppeal = new Date(user.appealedFirst).toLocaleDateString()
            comments += `\n> First Appeal: <t:${firstAppealTimestamp}:D>`
        }
        if (user.appealedLast) {
            const lastAppealTimestamp = Math.floor(new Date(user.appealedLast).getTime() / 1000)
            lastAppeal = new Date(user.appealedLast).toLocaleDateString()
            if (firstAppeal !== lastAppeal) {
                comments += `\n> Last Appeal: <t:${lastAppealTimestamp}:D>`
            }
        }

        const commonField = {
            name: 'User Information',
            value: comments,
            inline: false,
        }

        logger.info({
            labels: { command: 'checkuseradmin', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} (${interaction?.user?.id}) checked user ${member?.tag} (${user.id})`,
        })

        if (value.length >= 5) {
            const chunked = chunk(value, 5)
            const pages: APIEmbed[] = []

            chunked.forEach(chunk => {
                pages.push({
                    ...mainEmbed,
                    fields: [...[commonField], ...[{ name: 'Servers Found In', value: chunk.join('\n') }]],
                })
            })
            sendPagination(interaction, pages, 180000)
        } else {
            return sendEmbed({
                interaction,
                embed: {
                    ...mainEmbed,
                    fields: [
                        ...[commonField],
                        {
                            name: 'Servers Found In',
                            value:
                                value.length > 0
                                    ? value.join('\n')
                                    : `> User was upstatus'd therefore no servers found in\n> Reason: ${user.reason}`,
                        },
                    ],
                },
            })
        }

        return
    },
})
