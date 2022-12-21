import { ApplicationCommandOptionType } from 'discord.js';
import { Colours } from '../../@types/Colours';
import { Command } from '../../structures/Command';
import { sendError, sendSuccess } from '../../utils/messages';
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
            const inv = await client.fetchInvite(invite);
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

        const server = await client.prisma.getBadServer(lookup);

        if (!server) return sendSuccess(interaction, 'Server not found in the database');

        const addedBy = /^\d+$/.test(server.addedBy) ? `<@${server.addedBy}>` : server.addedBy;

        return sendEmbed({
            interaction,
            embed: {
                title: ':shield: Server Blacklisted',
                color: Colours.RED,
                fields: [
                    {
                        name: 'Server Information',
                        value: `**ID**: ${server.id} / **Name**: ${server.name}\n
                              **Details**: ${server.type.toLowerCase()}\n
                              **Date Added**: ${server.createdAt
                                  .toISOString()
                                  .replace(/T/, ' ')
                                  .replace(/\..+/, '')}\n
                                  **Added By**: ${addedBy}\n
                                  **Reason**: ${server.reason}\n
                                  **Invite**: <${server.invite}>\n`,
                    },
                ],
            },
        });
    },
});
