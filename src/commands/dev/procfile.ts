import { CommandInteraction } from 'discord.js';
import { Bot, SlashCommand } from '../../classes';
import { createAuditLog } from '../../utils/db';
import { sendEmbed } from '../../utils/messages';

export default class ProcfileCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'procfile',
            description: 'Process and Import User files',
            type: 'CHAT_INPUT',
            options: [],
            defaultPermission: false,
            staffRole: 'DEV',
        });
    }

    public async run(client: Bot, interaction: CommandInteraction): Promise<boolean> {
        if (client.processing.isProcessing()) {
            client.processing.disabledMessage(interaction);
            return false;
        }

        sendEmbed({
            interaction,
            embed: {
                description: '`🟢` Successfully started imports',
            },
        });

        createAuditLog(client, {
            executedBy: interaction.user.id,
            action: 'procfile_start',
            message: 'Started file imports',
        });

        client.processing.processData(interaction.user.id);
        return true;
    }
}
