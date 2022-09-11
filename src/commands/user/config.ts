import { CommandInteraction } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';

export default class ConfigCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'config',
            description: 'Adjust this Guilds Settings for Warden',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 'STRING',
                    name: 'logchan',
                    description: 'Log Channel ID',
                    required: false,
                },
            ],
            defaultPermission: false,
            permission: 'ADMINISTRATOR',
        });
    }

    public async run(client: Bot, interaction: CommandInteraction): Promise<boolean> {
        const logchan = interaction.options.get('logchan')?.value as string;
        if (logchan) {
            await client.db.guild
                .update({
                    where: { id: interaction.guild.id },
                    data: { logChannel: logchan },
                })
                .then(async () => {
                    await interaction.reply({
                        ephemeral: true,
                        embeds: [
                            {
                                description:
                                    'Successfully updated the log channel, make sure I can `SEND_MESSAGES` in that channel',
                                color: Colours.GREEN,
                            },
                        ],
                    });
                })
                .catch(async () => {
                    await interaction.reply({
                        ephemeral: true,
                        embeds: [
                            {
                                description:
                                    'An unexpected error has occured, please open a support ticket in Warden discord',
                                color: Colours.RED,
                            },
                        ],
                    });
                });
        } else {
            await interaction.reply({ ephemeral: true, content: 'Sent configuration menu' });
            client.config.sendConfigMenu(interaction, interaction.guild.id);
        }
        return true;
    }
}
