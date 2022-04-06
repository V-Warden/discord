import { BaseCommandInteraction, MessageEmbed } from 'discord.js';
import _ from 'lodash';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { getAllBadServers } from '../../utils/badservers';
import { sendPagination } from '../../utils/messages';

export default class BadServersCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'badservers',
            description: 'View a list of all the bad servers',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: true,
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const badServers = await getAllBadServers({ client });
        const desc: string[] = [];
        badServers.forEach(server => desc.push(`${server.id} | ${server.name}`));

        const chunks = _.chunk(desc, 15);
        const pages: MessageEmbed[] = [];
        chunks.forEach(chunk => {
            pages.push(
                new MessageEmbed({
                    author: {
                        name: 'Bad Server Listing',
                        icon_url: interaction.guild?.iconURL() ?? 'http://cdn.mk3ext.dev/vh5NME2rgr.png',
                    },
                    description: `\`\`\`ID                 | Name\n${chunk.join('\n')}\`\`\``,
                    color: Colours.RED,
                })
            );
        });
        sendPagination(interaction, pages, 60000);
        return true;
    }
}
