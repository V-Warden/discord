import { UserStatus } from '@prisma/client';
import { ApplicationCommandType } from 'discord.js';
import { ContextMenu } from '../../structures/ContextMenu';
import actionAppeal from '../../utils/actioning/actionAppeal';
import db from '../../utils/database';
import { sendError, sendSuccess } from '../../utils/messages';

export default new ContextMenu({
    name: 'Appeal User',
    type: ApplicationCommandType.User,
    main: true,
    defaultMemberPermissions: 'Administrator',
    run: async ({ interaction, client }) => {
        const id = interaction.targetId;

        const imports = await db.countUnappealedImports(id);
        if (imports === 0) return sendError(interaction, 'That user has no new servers to appeal');
        const appealPromise = db.appealImports(id);
        const updatePromise = db.updateUser(id, {
            status: UserStatus.APPEALED,
            appeals: {
                increment: 1,
            },
        });
        await Promise.all([appealPromise, updatePromise]);

        sendSuccess(interaction, `Successfully appealed <@${id}> (${id})`);

        return actionAppeal(client, id);
    },
});
