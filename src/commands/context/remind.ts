import { ApplicationCommandType } from 'discord.js';
import { ContextMenu } from '../../structures/ContextMenu';
import { sendError, sendSuccess } from '../../utils/messages';

export default new ContextMenu({
    name: 'Remind User',
    type: ApplicationCommandType.User,
    main: true,
    defaultMemberPermissions: 'Administrator',
    run: async ({ interaction }) => {
        const id = interaction.targetId;

        const member = await interaction.guild?.members.fetch(id);
        if (!member) return sendError(interaction, 'Unable to find member');

        member?.createDM().then(dm =>
            dm
                .send({ content: `Your attention is required in <#${interaction.channelId}>` })
                .then(() => sendSuccess(interaction, 'Successfully reminded user'))
                .catch(() => sendError(interaction, 'This user has DMs disabled or the bot blocked'))
        );

        return false;
    },
});
