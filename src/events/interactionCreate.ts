import { CommandInteractionOptionResolver } from 'discord.js'
import { client } from '../bot'
import { Event } from '../structures/Event'
import logger from '../utils/logger'

export default new Event('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        // Chat Input Commands
        const command = client.commands.get(interaction.commandName)
        if (!command) return interaction.followUp('You have used a non existent command')
        if (interaction.commandName === 'checkself') {
            await interaction.deferReply({ ephemeral: true })
        } else if (interaction.commandName !== 'config') {
            await interaction.deferReply()
        }

        try {
            await command.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction,
            })
        } catch (e) {
            logger.error({
                labels: { event: 'interactionCreate', command: interaction.commandName },
                message: e instanceof Error ? e.message : JSON.stringify(e),
            })
        }
    } else if (interaction.isMessageContextMenuCommand() || interaction.isUserContextMenuCommand()) {
        // Context Menu Commands
        const command = client.contextmenus.get(interaction.commandName)
        if (!command) return interaction.followUp('You have used a non existent context menu')
        try {
            await command.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction,
            })
        } catch (e) {
            logger.error({
                labels: { event: 'interactionCreate', command: interaction.commandName },
                message: e instanceof Error ? e.message : JSON.stringify(e),
            })
        }
    }

    return
})
