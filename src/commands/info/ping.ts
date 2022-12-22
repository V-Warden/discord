import { Command } from '../../structures/Command';

export default new Command({
    name: 'ping',
    description: 'replies with pong',
    run: async ({ interaction }) => {
        return interaction.followUp('Pong3');
    },
});
