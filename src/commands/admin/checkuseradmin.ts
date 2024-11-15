import { APIEmbed, ApplicationCommandOptionType } from 'discord.js';
import { capitalize, uploadText } from '../../utils/misc';
import { chunk } from 'lodash';
import { Colours } from '../../@types/Colours';
import { Command } from '../../structures/Command';
import { sendSuccess, sendWarning, sendError } from '../../utils/messages';
import { UserType } from '@prisma/client';
import actionAppeal from '../../utils/actioning/actionAppeal';
import db from '../../utils/database';
import logger from '../../utils/logger';
import sendEmbed from '../../utils/messages/sendEmbed';
import sendPagination from '../../utils/messages/sendPagination';

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

        const user = await db.getUser(id);
        if (!user) return sendSuccess(interaction, 'User not found in database');
        const [noteCount, imports, history] = await Promise.all([
            db.countNotes(id),
            db.getImports(id),
            db.getHistory(id),
        ]);

        let historyResponse;
        if (history.length > 0) {
            historyResponse = await uploadText(JSON.stringify(history, null, 4), '1h').catch(e => {
                logger.error({
                    labels: { command: 'checkuseradmin', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                });
            });
        } else {
            historyResponse = 'No prior history';
        }

        if (!historyResponse) return sendError(interaction, 'Failed to upload history');

        if (user.status === 'APPEALED') {
            return sendSuccess(
                interaction,
                `User has no outstanding servers to be appealed for\n\n> History: <${historyResponse}>\n> Notes: ${noteCount}`
            );
        }

        const allImportsPromise = db.getAllImports(user.id);
        const appealedImportsPromise = db.getAppealedImports(user.id);

        const [allImports, appealedImports] = await Promise.all([allImportsPromise, appealedImportsPromise]);

        if (
            (user.status === 'BLACKLISTED' &&
                user.reason === 'Unspecified' &&
                allImports.length === appealedImports.length) ||
            allImports.length === 0
        ) {
            await db.updateUser(user.id, { status: 'APPEALED', appeals: { increment: 1 } });
            await actionAppeal(client, user.id).catch(e => {
                logger.error({
                    labels: { command: 'checkuseradmin', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                });
            });

            if (allImports.length === 0) await db.deleteUser(user.id);

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

                const response = await uploadText(JSON.stringify(newData, null, 4), '1h').catch(e => {
                    logger.error({
                        labels: { command: 'checkuseradmin', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    });
                });

                if (!response) return sendError(interaction, 'Failed to upload legacy data');

                value.push(`Legacy Data\n> View data: <${response}>\n`);
            } else {
                realCount += 1;
                const dateFirst = new Date(x.createdAt);
                const dateLast = new Date(x.updatedAt);
                value.push(
                    `${x.BadServer.name}\n> Type: ${x.type} \n> Roles: ${x.roles
                        .split(';')
                        .join(
                            ', '
                        )}\n> First seen: ${dateFirst.toLocaleDateString()}\n> Last seen: ${dateLast.toLocaleDateString()}\n`
                );
            }
        }
        const mainEmbed = {
            title: ':shield: User In Database',
            thumbnail: { url: '' },
            description: `<@${user.id}> has been seen in ${realCount} bad Discord servers.`,
            color: Colours.BLUE,
        };

        const types: UserType[] = imports.map(x => x.type);
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

        logger.info({
            labels: { command: 'checkuseradmin', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} checked user ${user.id}`,
        });

        if (value.length >= 5) {
            const chunked = chunk(value, 5);
            const pages: APIEmbed[] = [];

            chunked.forEach(chunk => {
                pages.push({
                    ...mainEmbed,
                    fields: [...[commonField], ...[{ name: 'Servers Found In', value: chunk.join('\n') }]],
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
                                    : `> User was upstatus'd therefore no servers found in\n> Reason: ${user.reason}`,
                        },
                    ],
                },
            });
        }

        return;
    },
});
