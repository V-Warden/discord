import { ApplicationCommandOptionType, APIEmbed } from 'discord.js';
import { chunk } from 'lodash';
import { Colours } from '../../@types/Colours';
import { Command } from '../../structures/Command';
import { mapAnyType } from '../../utils/misc';
import { sendError } from '../../utils/messages';
import { UserType, UserStatus } from '@prisma/client';
import db from '../../utils/database';
import sendPagination from '../../utils/messages/sendPagination';

export default new Command({
    name: 'multiadduser',
    description: 'Add multiple users to the database',
    main: true,
    defaultMemberPermissions: 'Administrator',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'users',
            description: 'Comma-separated list of user IDs',
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'type',
            description: 'User Type',
            required: true,
            choices: mapAnyType(UserType),
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'status',
            description: 'User Status',
            required: true,
            choices: mapAnyType(UserStatus),
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'server',
            description: 'Linked Server',
            required: true,
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'reason',
            description: 'Reason',
            required: true,
        },
    ],
    run: async ({ interaction, client }) => {
        const idsString = interaction.options.getString('users');
        if (!idsString) return sendError(interaction, 'Invalid user IDs provided');
        const status = interaction.options.get('status')?.value as UserStatus;
        const type = interaction.options.get('type')?.value as UserType;
        const server = interaction.options.get('server')?.value as string;
        const reason = interaction.options.get('reason')?.value as string;

        const ids = idsString.split(',').map(id => id.trim());
        if (ids.length === 0) return sendError(interaction, 'No valid user IDs provided');

        const isBadServer = await db.getBadServer({ id: server });
        if (!isBadServer) return sendError(interaction, 'Server is not blacklisted');

        const fields: APIEmbed['fields'] = [];

        for (const id of ids) {
            try {
                const user = await client.users.fetch(id);
                if (!user) {
                    fields.push({
                        name: `ID: ${id}`,
                        value: `**User:** <@${id}> **Status:** Invalid ID provided`,
                    });
                    continue;
                }

                const count = await db.userExist(id);

                if (count) {
                    const createPromise = db.createImport(id, server, type);
                    const updatePromise = db.updateUser(id, { status, type, reason });
                    await Promise.all([createPromise, updatePromise]);
                } else {
                    await db.createUser({
                        id,
                        last_username: 'unknown#0000',
                        avatar: 'https://chibi.iitranq.co.uk/w70AB7OgtqiQ.png',
                        type,
                        status,
                        reason,
                        servers: {
                            connectOrCreate: {
                                where: {
                                    id_server: {
                                        id,
                                        server,
                                    },
                                },
                                create: {
                                    BadServer: {
                                        connect: {
                                            id: server,
                                        },
                                    },
                                    roles: 'Undefined',
                                    type,
                                    appealed: false,
                                    reason: reason,
                                },
                            },
                        },
                    });
                }

                fields.push({
                    name: `ID: ${id}`,
                    value: `**User:** <@${id}> **Status:** Successfully upserted`,
                });
            } catch (error) {
                fields.push({
                    name: `ID: ${id}`,
                    value: `**User:** <@${id}> **Status:** Error processing user`,
                });
            }
        }

        const chunkedFields = chunk(fields, 10);
        const pages: APIEmbed[] = chunkedFields.map(chunk => ({
            title: ':shield: Multi Add User',
            color: Colours.GREEN,
            fields: chunk,
        }));

        sendPagination(interaction, pages, 180000);
        return;
    },
});
