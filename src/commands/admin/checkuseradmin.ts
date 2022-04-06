import { BaseCommandInteraction, Snowflake } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { getBadServersByIDs } from '../../utils/badservers';
import { sendEmbed } from '../../utils/messages';
import { getUser } from '../../utils/users';

export default class CheckUserAdminCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'checkuseradmin',
            description: 'Check user database status as an admin',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 3,
                    name: 'userid',
                    description: 'User ID to check',
                    required: false,
                },
                {
                    type: 6,
                    name: 'user',
                    description: 'User Mention to check',
                    required: false,
                },
            ],
            defaultPermission: true,
            staffRole: 'admin',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const id = (interaction.options.getUser('user')?.id ||
            interaction.options.get('userid')?.value) as Snowflake;

        if (!id) {
            sendEmbed({
                interaction,
                embed: {
                    description: 'You must provided either a user or user id',
                    color: Colours.YELLOW,
                },
            });
            return false;
        }

        getUser({ client, id })
            .then(async user => {
                const roles = user.roles !== '' ? user.roles.split(';').join(',\n') : 'None';

                const ids = user.servers.split(';');

                const badServers = await getBadServersByIDs({
                    client,
                    ids,
                });

                const badNames = badServers.map(i => i.name);

                sendEmbed({
                    interaction,
                    embed: {
                        title: ':shield: User In Database',
                        description: `<@${user.id}> has been seen in ${
                            user.servers.split(';').length
                        } bad Discord servers.`,
                        author: {
                            name: user.last_username,
                            icon_url: user.avatar,
                        },
                        thumbnail: { url: user.avatar },
                        color: Colours.RED,
                        fields: [
                            {
                                name: 'User Information',
                                value: `**ID**: ${user.id} / **Name**: ${user.last_username}`,
                                inline: false,
                            },
                            {
                                name: 'Known Discord Roles',
                                value: roles.substring(0, 1024),
                                inline: false,
                            },
                            {
                                name: 'Known Servers',
                                value:
                                    badNames.length > 0
                                        ? badNames.join(',\n').substring(0, 1024)
                                        : 'None',
                                inline: false,
                            },
                            {
                                name: 'Database Information',
                                value: `**User Status**: ${user.status.toLowerCase()}\n**User Type**: ${user.user_type.toLowerCase()}\n**Details**: ${
                                    user.reason
                                }\n**Appeals**: ${user.appeals}`,
                                inline: false,
                            },
                            {
                                name: `Added Type: ${user.filter_type.replace('_', '-')}`,
                                value: `**Date Added**: ${user.createdAt
                                    .toISOString()
                                    .replace(/T/, ' ')
                                    .replace(/\..+/, '')}`,
                                inline: false,
                            },
                        ],
                        footer: {
                            text: 'VVarden by Vampire#8144',
                        },
                    },
                });
            })
            .catch(async () => {
                sendEmbed({
                    interaction,
                    embed: {
                        description:
                            ':white_check_mark: UserID not found in Database.\nThey are either fine or not yet listed.',
                        color: Colours.YELLOW,
                    },
                });
            });

        return true;
    }
}
