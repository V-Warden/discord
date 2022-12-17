import { CommandInteractionOptionResolver } from 'discord.js';
import { client } from '../bot';
import { Event } from '../structures/Event';
import { logException } from '../utils/logger';

export default new Event('interactionCreate', async interaction => {
    // Chat Input Commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return interaction.followUp('You have used a non existent command');
        await interaction.deferReply();

        try {
            await command.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction,
            });
        } catch (e) {
            console.log(e);
            logException(interaction, e);
        }
    }
    // Context Menu Commands
    else if (interaction.isMessageContextMenuCommand() || interaction.isUserContextMenuCommand()) {
        const command = client.contextmenus.get(interaction.commandName);
        if (!command) return interaction.followUp('You have used a non existent context menu');
        try {
            await command.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction,
            });
        } catch (e) {
            console.log(e);
            logException(interaction, e);
        }
    }
    return;
});
