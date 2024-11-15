import { ApplicationCommandOptionType } from 'discord.js';
import { Colours } from '../../@types/Colours';
import { Command } from '../../structures/Command';
import { sendError, sendSuccess } from '../../utils/messages';
import db from '../../utils/database';
import logger from '../../utils/logger';
import sendEmbed from '../../utils/messages/sendEmbed';

export default new Command({
    name: 'checkserveradmin',
    description: 'Check server database status as an admin',
    main: true,
    defaultMemberPermissions: 'Administrator',
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
            const inv = await client.fetchInvite(invite).catch(e => {
                logger.error({
                    labels: { command: 'checkserveradmin', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
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
            labels: { command: 'checkserveradmin', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} checked server ${server.id}`,
        });

        return sendEmbed({
            interaction,
            embed: {
                title: ':shield: Server Blacklisted',
                color: Colours.BLUE,
                fields: [
                    {
                        name: 'Server ID',
                        value: server.id,
                        inline: true,
                    },
                    {
                        name: 'Server Name',
                        value: server.name,
                        inline: true,
                    },
                    {
                        name: 'Details',
                        value: server.type.toLowerCase(),
                        inline: true,
                    },
                    {
                        name: 'Date Added',
                        value: server.createdAt.toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                        inline: true,
                    },
                    {
                        name: 'Added By',
                        value: addedBy,
                        inline: true,
                    },
                    {
                        name: 'Reason',
                        value: server.reason,
                        inline: false,
                    },
                    {
                        name: 'Invite',
                        value: `${server.invite}`,
                        inline: false,
                    },
                ]
            },
        });
    },
});
