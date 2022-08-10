import { CommandInteraction, Snowflake, TextChannel } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { sendEmbed } from '../../utils/messages';

export default class FixGuildCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'fixguild',
            description: 'Fix non existant guild in database',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 'STRING',
                    name: 'id',
                    description: 'Guild ID',
                    required: true,
                },
            ],
            defaultPermission: false,
            staffRole: 'DEV',
            permission: 'ADMINISTRATOR',
        });
    }

    public async run(client: Bot, interaction: CommandInteraction): Promise<boolean> {
        const id = interaction.options.get('id').value as Snowflake;

        const guild = await client.guilds.fetch(id);

        if (!guild) {
            sendEmbed({
                interaction,
                embed: {
                    description: '`🟡` Invalid guild id provided',
                    color: Colours.YELLOW,
                },
            });
            return false;
        }

        const channel = (await guild.channels.fetch()).first();

        await client.db.guild
            .create({
                data: {
                    id: guild.id,
                    name: guild.name,
                    logChannel: channel.id,
                    punishments: {
                        create: {},
                    },
                },
            })
            .then(() => {
                sendEmbed({
                    interaction,
                    embed: {
                        description: '`🟢` Successfully created guild',
                        color: Colours.GREEN,
                    },
                });
            })
            .catch(e => console.log(e));

        return true;
    }
}
