import { Command } from '../../structures/Command'
import logger from '../../utils/logger'

export default new Command({
    name: 'ping',
    description: 'Gives a response',
    run: async ({ interaction }) => {
        logger.info({
            labels: { command: 'ping', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} (${interaction?.user?.id}) pinged the bot`,
        })

        return interaction.followUp('Volumed is very cool!')
    },
})
