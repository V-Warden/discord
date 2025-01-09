import { APIEmbed } from 'discord.js'
import { chunk } from 'lodash'
import { Colours } from '../../@types/Colours'
import { Command } from '../../structures/Command'
import db from '../../utils/database'
import logger from '../../utils/logger'
import sendPagination from '../../utils/messages/sendPagination'

export default new Command({
    name: 'badservers',
    description: 'View a list of all the bad servers',
    run: async ({ interaction }) => {
        const badServers = await db.getAllBadServers()
        const desc: string[] = []
        badServers.forEach(server => desc.push(`${server.id} | ${server.name}`))

        const chunks = chunk(desc, 15)
        const pages: APIEmbed[] = []
        chunks.forEach(chunk => {
            pages.push({
                author: {
                    name: 'Bad Server Listing',
                    icon_url: interaction.guild?.iconURL() ?? 'http://cdn.mk3ext.dev/vh5NME2rgr.png',
                },
                description: `\`\`\`ID                 | Name\n${chunk.join('\n')}\`\`\``,
                color: Colours.BLUE,
            })
        })

        logger.info({
            labels: { command: 'badservers', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} (${interaction?.user?.id}) requested bad servers list`,
        })

        return sendPagination(interaction, pages, 60000)
    },
})
