import { Colours } from '../../@types/Colours';
import { Command } from '../../structures/Command';
import logger from '../../utils/logger';
import sendEmbed from '../../utils/messages/sendEmbed';

export default new Command({
    name: 'invite',
    description: 'Shares the link to invite this bot to your own discord',
    run: async ({ interaction }) => {
        logger.info({
            labels: { command: 'invite', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} (${interaction?.user?.id}) requested the invite link`,
        });

        return sendEmbed({
            interaction,
            embed: {
                title: 'Invite Me',
                description: `If you would like to invite me to your own discord: [Click Me](https://discord.com/api/oauth2/authorize?client_id=874059310869655662&permissions=8&scope=bot%20applications.commands)
                          \nI will need kick, ban and manage role permissions as well as a role higher than the users I am acting on.`,
                color: Colours.BLUE,
            },
        });
    },
});
