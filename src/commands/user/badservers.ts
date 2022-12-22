import { Command } from '../../structures/Command';
import { chunk } from 'lodash';
import { APIEmbed } from 'discord.js';
import { Colours } from '../../@types/Colours';
import sendPagination from '../../utils/messages/sendPagination';
import db from '../../utils/database';

export default new Command({
    name: 'badservers',
    description: 'View a list of all the bad servers',
    run: async ({ interaction, client }) => {
        const badServers = await db.getAllBadServers();
        const desc: string[] = [];
        badServers.forEach(server => desc.push(`${server.id} | ${server.name}`));

        const chunks = chunk(desc, 15);
        const pages: APIEmbed[] = [];
        chunks.forEach(chunk => {
            pages.push({
                author: {
                    name: 'Bad Server Listing',
                    icon_url: interaction.guild?.iconURL() ?? 'http://cdn.mk3ext.dev/vh5NME2rgr.png',
                },
                description: `\`\`\`ID                 | Name\n${chunk.join('\n')}\`\`\``,
                color: Colours.RED,
            });
        });
        return sendPagination(interaction, pages, 60000);
    },
});
