import { APIEmbed, ApplicationCommandOptionType } from 'discord.js';
import { Colours } from '../../@types/Colours';
import { Command } from '../../structures/Command';
import { sendSuccess } from '../../utils/messages';
import sendPagination from '../../utils/messages/sendPagination';
import { chunk } from 'lodash';
import { capitalize, uploadText } from '../../utils/misc';
import sendEmbed from '../../utils/messages/sendEmbed';

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
        const id = interaction.options.getUser('user')?.id as string;

        const user = await client.prisma.getUser(id);
        if (!user) return sendSuccess(interaction, 'User not found in database');

        const [noteCount, imports, history] = await Promise.all([
            client.prisma.countNotes(id),
            client.prisma.getImports(id),
            client.prisma.getHistory(id),
        ]);

        let historyResponse;
        if (history.length > 0) {
            historyResponse = await uploadText(JSON.stringify(history, null, 4), '1h');
        } else {
            historyResponse = 'No prior history';
        }

        if (imports.length === 0 && user.status === 'APPEALED') {
            return sendSuccess(
                interaction,
                `User has no outstanding servers to be appealed for\n\n> History: <${historyResponse}>\n> Notes: ${noteCount}`
            );
        } else {
            const value = [];
            let realCount = 0;

            for (let i = 0, l = imports.length; i < l; ++i) {
                const x = imports[i];
                if (x.roles.includes('"servers":')) {
                    const parsed = JSON.parse(x.roles);
                    const servers = parsed['servers'].split(';');

                    const badServers = await client.prisma.getBadServers(servers);
                    realCount += servers.length;

                    const names = badServers.map(x => x.name);
                    const roles = parsed['roles'].split(';');
                    const newData = [{ names, roles }];

                    const response = await uploadText(JSON.stringify(newData, null, 4), '1h');

                    value.push(`Legacy Data\n> View data: <${response}>\n`);
                } else {
                    realCount += 1;
                    const date = new Date(x.createdAt);
                    value.push(
                        `${x.BadServer.name}\n> Type: ${x.type} \n> Roles: ${x.roles
                            .split(';')
                            .join(', ')}\n> Added: ${date.toLocaleDateString()}\n`
                    );
                }
            }

            let avatar: string = user.avatar;

            if (avatar === user.last_username) {
                avatar = client.user?.defaultAvatarURL ?? '';
            }

            const mainEmbed = {
                author: {
                    name: user.last_username,
                    icon_url: avatar,
                },
                title: ':shield: User In Database',
                thumbnail: { url: avatar },
                description: `<@${user.id}> has been seen in ${realCount} bad Discord servers.`,
                color: Colours.RED,
            };

            const commonField = {
                name: 'User Information',
                value: `> ID: ${user.id}\n> Status: ${capitalize(user.status)}\n> Type: ${capitalize(
                    user.type
                )}\n> History: ${historyResponse}\n> Notes: ${noteCount}\n> Appeals: ${user.appeals}`,
                inline: false,
            };

            if (value.length >= 5) {
                const chunked = chunk(value, 5);
                const pages: APIEmbed[] = [];

                chunked.forEach(chunk => {
                    pages.push({
                        ...mainEmbed,
                        fields: [...[commonField], ...[{ name: 'New Servers', value: chunk.join('\n') }]],
                    });
                });
                sendPagination(interaction, pages, 180000);
            } else {
                return sendEmbed({
                    interaction,
                    embed: {
                        ...mainEmbed,
                        fields: [
                            ...[commonField],
                            {
                                name: 'New Servers',
                                value:
                                    value.length > 0
                                        ? value.join('\n')
                                        : "> User was upstatus'd therefore no new servers",
                            },
                        ],
                    },
                });
            }
        }

        return;
    },
});
