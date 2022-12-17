import { UserStatus } from '@prisma/client';
import { ApplicationCommandType } from 'discord.js';
import { ContextMenu } from '../../structures/ContextMenu';
import { sendError, sendSuccess } from '../../utils/messages';

export default new ContextMenu({
    name: 'Appeal User',
    type: ApplicationCommandType.User,
    main: true,
    defaultMemberPermissions: 'Administrator',
    run: async ({ interaction, client }) => {
        const id = interaction.targetId;

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
