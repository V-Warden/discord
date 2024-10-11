import { Users } from '@prisma/client';
import { APIEmbed, ApplicationCommandType } from 'discord.js';
import { capitalize, chunk } from 'lodash';
import { Colours } from '../../@types/Colours';
import { ContextMenu } from '../../structures/ContextMenu';
import actionAppeal from '../../utils/actioning/actionAppeal';
import db from '../../utils/database';
import { sendSuccess, sendWarning } from '../../utils/messages';
import sendEmbed from '../../utils/messages/sendEmbed';
import sendPagination from '../../utils/messages/sendPagination';
import { uploadText } from '../../utils/misc';

export default new ContextMenu({
    name: 'Check User Status (Admin)',
    type: ApplicationCommandType.User,
    main: true,
    run: async ({ interaction, client }) => {
        const id: any = interaction.targetId;

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

        const allImportsPromise = db.getAllImports(user.id);
        const appealedImportsPromise = db.getAppealedImports(user.id);

        const [allImports, appealedImports] = await Promise.all([allImportsPromise, appealedImportsPromise]);

        if (imports.length === 0 && user.status === 'APPEALED') {
            return sendSuccess(
                interaction,
                `User has no outstanding servers to be appealed for\n\n> History: <${historyResponse}>\n> Notes: ${noteCount}`
            );
        }

        if (
            user.status === 'BLACKLISTED' &&
            user.reason === 'Unspecified' &&
            allImports.length === appealedImports.length
        ) {
            await db.updateUser(user.id, { status: 'APPEALED', appeals: { increment: 1 } });
            await actionAppeal(client, user.id);
            return sendWarning(
                interaction,
                `User is apart of a unblacklisted server, correcting status and appealing\n\n> History: <${historyResponse}>\n> Notes: ${noteCount}`
            );
        }


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
                const dateFirst = new Date(x.createdAt);
                const dateLast = new Date(x.updatedAt);
                value.push(
                    `${x.BadServer.name}\n> Type: ${x.type} \n> Roles: ${x.roles
                        .split(';')
                        .join(', ')}\n> First seen: ${dateFirst.toLocaleDateString()}\n> Last seen: ${dateLast.toLocaleDateString()}\n`
                );
            }
        }

        const mainEmbed = {
            title: ':shield: User In Database',
            thumbnail: { url: '' },
            description: `<@${user.id}> has been seen in ${realCount} bad Discord servers.`,
            color: Colours.RED,
        };

        const types = imports.map(x => x.type);
        types.push(user.type);
        const highestType = db.findHighestType(types);
        let comments = `> ID: ${user.id}\n> Status: ${capitalize(user.status)}\n> Type: ${capitalize(
            highestType
        )}\n> History: ${historyResponse}\n> Notes: ${noteCount}\n> Appeals: ${user.appeals}`;
        if (user.status === 'PERM_BLACKLISTED') {
            if (user.reason !== '' && user.reason !== null && user.reason !== 'Unspecified') {
                comments = `> ID: ${user.id}\n> Status: ${capitalize(user.status)}\n > Reason: ${user.reason}\n>  Type: ${capitalize(
                    highestType
                )}\n> History: ${historyResponse}\n> Notes: ${noteCount}\n> Appeals: ${user.appeals}`;
            }
        }
        const commonField = {
            name: 'User Information',
            value: comments,
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
                            name: 'Servers Found In',
                            value:
                                value.length > 0
                                    ? value.join('\n')
                                    : `> User was upstatus'd therefore no new servers\n> Reason: ${user.reason}`,
                        },
                    ],
                },
            });
        }

        return false;
    },
});
