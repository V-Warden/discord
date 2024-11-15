import { ApplicationCommandType } from 'discord.js';
import { ContextMenu } from '../../structures/ContextMenu';
import { sendError, sendSuccess } from '../../utils/messages';
import logger from '../../utils/logger';

export default new ContextMenu({
    name: 'Remind User',
    type: ApplicationCommandType.User,
    main: true,
    defaultMemberPermissions: 'Administrator',
    run: async ({ interaction }) => {
        const id = interaction.targetId;

        const member = await interaction.guild?.members.fetch(id).catch(e => {
            logger.error({
                labels: { command: 'remind', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: e instanceof Error ? e.message : JSON.stringify(e),
            });
        });
        if (!member) return sendError(interaction, 'Unable to find member');

        member?.createDM().then(dm =>
            dm
                .send({ content: `Your attention is required in <#${interaction.channelId}>` })
                .then(() => sendSuccess(interaction, 'Successfully reminded user'))
                .catch(() => sendError(interaction, 'This user has DMs disabled or the bot blocked'))
        );

        logger.info({
            labels: { command: 'remind', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} reminded ${id}`,
        });

        return false;
    },
});
