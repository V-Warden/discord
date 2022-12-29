import { Users } from '@prisma/client';
import { APIEmbed, ApplicationCommandType } from 'discord.js';
import { capitalize, chunk } from 'lodash';
import { Colours } from '../../@types/Colours';
import { ContextMenu } from '../../structures/ContextMenu';
import db from '../../utils/database';
import { sendSuccess } from '../../utils/messages';
import sendEmbed from '../../utils/messages/sendEmbed';
import sendPagination from '../../utils/messages/sendPagination';
import { uploadText } from '../../utils/misc';

export default new ContextMenu({
    name: 'Check User Status (Admin)',
    type: ApplicationCommandType.User,
    main: true,
    run: async ({ interaction, client }) => {
        const id = interaction.targetId;

        const user: Users | null = await db.getUser(id);
        if (!user) return sendSuccess(interaction, 'User not found in database');

        const [noteCount, imports, history] = await Promise.all([
            db.countNotes(id),
            db.getImports(id),
            db.getHistory(id),
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

                    const badServers = await db.getBadServers(servers);
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
                                        : `> User was upstatus'd therefore no new servers\n> Reason: ${user.reason}`,
                            },
                        ],
                    },
                });
            }
        }

        return false;
    },
});
