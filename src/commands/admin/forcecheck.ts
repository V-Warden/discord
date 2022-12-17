import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command';
import actionUserGlobal from '../../utils/actioning/actionUserGlobal';
import { sendError, sendSuccess } from '../../utils/messages';

export default new Command({
    name: 'forcecheck',
    description: 'Globally check a user',
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
        if (!id) return sendError(interaction, 'Invalid user or id provided');

        const user = await client.prisma.getUser(id);
        if (!user) return sendError(interaction, 'User not found in database');
        if (user.status === 'WHITELISTED')
            return sendError(interaction, 'You cannot action a whitelisted user');
        if (user.status === 'APPEALED') return sendError(interaction, 'You cannot action an appealed user..');
        if (user.type === 'BOT') return sendError(interaction, 'You cannot action a bot user');

        sendSuccess(interaction, 'Requested force check on all shards');
        client.shard?.send({ action: 'forcecheck', userid: id });

        return false;
    },
});
