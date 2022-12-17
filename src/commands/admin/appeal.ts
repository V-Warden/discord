import { UserStatus } from '@prisma/client';
import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command';
import { sendError, sendSuccess } from '../../utils/messages';

export default new Command({
    name: 'appeal',
    description: 'Appeal a user',
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

        const imports = await client.prisma.countUnappealedImports(id);
        if (imports === 0) return sendError(interaction, 'That user has no new servers to appeal');
        const appealPromise = client.prisma.appealImports(id);
        const updatePromise = client.prisma.updateUser(id, {
            status: UserStatus.APPEALED,
            appeals: {
                increment: 1,
            },
        });
        await Promise.all([appealPromise, updatePromise]);

        sendSuccess(interaction, `Successfully appealed <@${id}> (${id})`);
        client.shard?.send({ action: 'appeal', userid: id });

        return false;
    },
});
