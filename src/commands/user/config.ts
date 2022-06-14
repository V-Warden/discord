import { CommandInteraction } from 'discord.js';
import { Bot, SlashCommand } from '../../classes';

export default class ConfigCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'config',
            description: 'Adjust this Guilds Settings for Warden',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: false,
            permission: 'ADMINISTRATOR',
        });
    }

    public async run(client: Bot, interaction: CommandInteraction): Promise<boolean> {
        await interaction.reply({ ephemeral: true, content: 'Sent configuration menu' });
        client.config.sendConfigMenu(interaction, interaction.guild.id);
        return true;
    }
}
