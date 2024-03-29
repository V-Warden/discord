import { UserStatus } from '@prisma/client';
import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../structures/Command';
import actionAppeal from '../../utils/actioning/actionAppeal';
import logger from '../../utils/logger';
import db from '../../utils/database';
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

        const user = await db.getUser(id);

        if (user?.status === 'APPEALED')
            return sendError(interaction, 'That user has no new servers to appeal');

        if (user?.status === 'WHITELISTED')
            return sendError(interaction, 'That user is whitelisted. Use upstatus to change.');

        const appealPromise = db.appealImports(id);
        const updatePromise = db.updateUser(id, {
            status: UserStatus.APPEALED,
            appeals: {
                increment: 1,
            },
        });
        await Promise.all([appealPromise, updatePromise]);

        sendSuccess(interaction, `Successfully appealed <@${id}> (${id})`);
        await db.increaseAppealsStaff(interaction.user.id);

        logger.info({
            labels: { action: 'appeal', guildId: interaction?.guild?.id },
            message: `${interaction?.user?.id} appealed ${id} from ${interaction?.guild?.id}`,
        });

        return actionAppeal(client, id);
    },
});
