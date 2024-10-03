import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command';
import actionUsersGlobal from '../../utils/actioning/actionUsersGlobal';
import db from '../../utils/database';
import { sendError, sendSuccess } from '../../utils/messages';

export default new Command({
    name: 'multiforcecheck',
    description: 'Globally check users',
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

        for (const id of ids) {
            const user = await db.getUser(id);
            if (!user) return sendError(interaction, `User with ID ${id} not found in database`);
            if (user.status === 'WHITELISTED')
                return sendError(interaction, `You cannot action a whitelisted user with ID ${id}`);
            if (user.status === 'APPEALED')
                return sendError(interaction, `You cannot action an appealed user with ID ${id}`);
            if (user.type === 'BOT')
                return sendError(interaction, `You cannot action a bot user with ID ${id}`);
        }

        sendSuccess(interaction, 'Requested force check on all shards');
        await actionUsersGlobal(client, ids);
        sendSuccess(interaction, 'Force check successfully completed');

        return false;
    },
});
