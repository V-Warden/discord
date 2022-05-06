import { BaseCommandInteraction } from 'discord.js';
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

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        client.config.sendConfigMenu(interaction);
        await interaction.deleteReply();
        return true;
    }
}
