import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command';
import { mapAnyType } from '../../utils/misc';
import { sendError, sendSuccess } from '../../utils/messages';
import { UserType, UserStatus } from '@prisma/client';
import db from '../../utils/database';
import logger from '../../utils/logger';

export default new Command({
    name: 'adduser',
    description: 'Add a user to the database',
    main: true,
    defaultMemberPermissions: 'Administrator',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'id',
            description: 'User ID',
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
        const id = interaction.options.get('id')?.value as string;
        const status = interaction.options.get('status')?.value as UserStatus;
        const type = interaction.options.get('type')?.value as UserType;
        const server = interaction.options.get('server')?.value as string;
        const reason = interaction.options.get('reason')?.value as string;

        if (id?.length < 17 || id?.length > 20) return sendError(interaction, 'Invalid ID provided');

        const isBadServer = await db.getBadServer({ id: server });
        if (!isBadServer) return sendError(interaction, 'Server is not blacklisted');

        const user = await client.users.fetch(id).catch(e => {
            logger.error({
                labels: { command: 'adduser', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: e instanceof Error ? e.message : JSON.stringify(e),
            });
        });
        if (!user) return sendError(interaction, 'Invalid id provided');

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

        logger.info({
            labels: { command: 'adduser', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} added user ${id} to the database`,
        });

        return sendSuccess(
            interaction,
            `**User:** <@${id}> (${id}) **Status:** Successfully upserted`
        );
    },
});
