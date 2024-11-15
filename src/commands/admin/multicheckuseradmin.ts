import { APIEmbed, ApplicationCommandOptionType } from 'discord.js';
import { chunk } from 'lodash';
import { Colours } from '../../@types/Colours';
import { Command } from '../../structures/Command';
import { sendError } from '../../utils/messages';
import db from '../../utils/database';
import logger from '../../utils/logger';
import sendPagination from '../../utils/messages/sendPagination';

export default new Command({
    name: 'multicheckuseradmin',
    description: 'Check users database status as an admin',
    main: true,
    defaultMemberPermissions: 'Administrator',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'users',
            description: 'Comma-separated list of user IDs',
            required: true,
        },
    ],
    run: async ({ interaction, client }) => {
        const idsString = interaction.options.getString('users');
        if (!idsString) return sendError(interaction, 'Invalid user IDs provided');

        const ids = idsString.split(',').map(id => id.trim());
        if (ids.length === 0) return sendError(interaction, 'No valid user IDs provided');

        const users = await db.getManyUsers({
            id: { in: ids }
        });

        const foundIds = users.map(user => user.id);
        const notFoundIds = ids.filter(id => !foundIds.includes(id));
        
        let fields: APIEmbed['fields'] = [];

        if (notFoundIds.length > 0) {
            for (const id of notFoundIds) {
                fields.push({
                    name: `**ID**: ${id}`,
                    value: `**User:** <@${id}> **Status:** Not found`,
                });
            }
        }

        for (const user of users) {
            const { id, status } = user;

            fields.push({
                name: `ID: ${id}`,
                value: `**User:** <@${id}> **Status:** ${status}`,
            });
        }

        const chunkedFields = chunk(fields, 10);
        const pages: APIEmbed[] = chunkedFields.map(chunk => ({
            title: ':shield: Multi CUA',
            color: Colours.RED,
            fields: chunk,
        }));

        logger.info({
            labels: { command: 'multicheckuseradmin', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} requested multi check on ${ids.length} users`,
        });

        sendPagination(interaction, pages, 180000);
        return;
    },
});
