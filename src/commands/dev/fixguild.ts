import { Guild } from '@prisma/client';
import { BaseCommandInteraction, Snowflake, TextChannel } from 'discord.js';
import { Colours } from '../../@types';
import { Bot, SlashCommand } from '../../classes';
import { createGuild } from '../../utils/guild';
import { sendEmbed } from '../../utils/messages';

export default class FixGuildCommand extends SlashCommand {
    constructor(client: Bot) {
        super({
            client,
            name: 'fixguild',
            description: 'Fix an unknown guild (Dev)',
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 3,
                    name: 'sid',
                    description: 'Server id to fix',
                    required: true,
                },
            ],
            defaultPermission: true,
            staffRole: 'dev',
        });
    }

    public async run(client: Bot, interaction: BaseCommandInteraction): Promise<boolean> {
        const id = interaction.options.get('sid').value as Snowflake;

        client.guilds
            .fetch(id)
            .then(async guild => {
                const channel = (await (await guild.channels.fetch())
                    .filter(chan => chan.isText())
                    .first()) as TextChannel;

                createGuild({ client, guild, logchan: channel.id }).then(g => {
                    const created = g as Guild;
                    sendEmbed({
                        interaction,
                        embed: {
                            description: `\`🟢\` Successfully create guild ${
                                created.name
                            } with: \`\`\`${{ guild, logchan: channel.id }}`,
                            color: Colours.GREEN,
                        },
                    });
                });
            })
            .catch(() => {
                sendEmbed({
                    interaction,
                    embed: {
                        description: '`🟡` Unknown guild or bot is not in this guild',
                        color: Colours.YELLOW,
                    },
                });
            });

        return true;
    }
}
