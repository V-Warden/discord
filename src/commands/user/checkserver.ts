import { ApplicationCommandOptionType } from 'discord.js';
import { Colours } from '../../@types/Colours';
import { Command } from '../../structures/Command';
import { sendError, sendSuccess } from '../../utils/messages';
import sendEmbed from '../../utils/messages/sendEmbed';
import logger from '../../utils/logger';
import db from '../../utils/database';

export default new Command({
    name: 'checkserver',
    description: 'Check if a server is blacklisted or not',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'id',
            description: 'Server ID',
            required: false,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'name',
            description: 'Server Name',
            required: false,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'invite',
            description: 'Server Invite',
            required: false,
        },
    ],
    run: async ({ interaction, client }) => {
        const sid = interaction.options.get('id')?.value as string;
        const sname = interaction.options.get('name')?.value as string;
        const invite = interaction.options.get('invite')?.value as string;

        if (!sid && !sname && !invite)
            return sendError(interaction, 'You must provide either a name, id or invite to check');

        let lookup: any;
        if (invite) {        
            const inv = await client.fetchInvite(invite).then(inv => inv).catch(e => {
                logger.error({
                    labels: { command: 'checkserver', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                });
            });
            if (!inv) return sendError(interaction, 'Invalid invite or invite has expired');

            lookup = { id: inv?.guild?.id };
        } else if (sname) {
            lookup = {
                name: {
                    contains: sname,
                },
            };
        } else if (sid) {
            lookup = {
                id: sid
            }
        }

        const server = await db.getBadServer(lookup);

        if (!server) return sendSuccess(interaction, 'Server not found in the database');

        const addedBy = /^\d+$/.test(server.addedBy) ? `<@${server.addedBy}>` : server.addedBy;

        logger.info({
            labels: { command: 'checkserver', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} (${interaction?.user?.id}) checked server ${server.id}`,
        });

        return sendEmbed({
            interaction,
            embed: {
                title: ':shield: Server Blacklisted',
                color: Colours.BLUE,
                fields: [
                    {
                        name: 'Server Information',
                        value: `**ID**: ${server.id} / **Name**: ${server.name}\n
                              **Details**: ${server.type.toLowerCase()}\n
                              **Date Added**: ${server.createdAt
                                  .toISOString()
                                  .replace(/T/, ' ')
                                  .replace(/\..+/, '')}\n
                              **Added By**: ${addedBy}`,
                    },
                ],
            },
        });
    },
});
