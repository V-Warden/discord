import { BaseCommandInteraction, ButtonInteraction, Message } from 'discord.js';
import { Colours } from '../@types';
import { Bot } from '../classes';
export default async function (client: Bot, interaction: ButtonInteraction): Promise<void> {
    const customId = interaction.customId.split('CONFIG_')[1];

    const message = await interaction.channel.messages.fetch(interaction.message.id);

    switch (customId) {
        case 'TOGGLE_ACTIONING': {
            const isEnabled = await client.db.guild.findUnique({
                where: { id: message.guildId },
                select: { enabled: true },
            });
            if (isEnabled.enabled) {
                await client.db.guild.update({
                    where: { id: message.guildId },
                    data: { enabled: false },
                });
            } else {
                await client.db.guild.update({
                    where: { id: message.guildId },
                    data: { enabled: true },
                });
            }
            break;
        }
        case 'TOGGLE_UNBAN': {
            const isEnabled = await client.db.guild.findUnique({
                where: { id: message.guildId },
                select: { appealunban: true },
            });
            if (isEnabled.appealunban) {
                await client.db.guild.update({
                    where: { id: message.guildId },
                    data: { appealunban: false },
                });
            } else {
                await client.db.guild.update({
                    where: { id: message.guildId },
                    data: { appealunban: true },
                });
            }
            break;
        }
        case 'LOG_CHANNEL': {
            // Comment out for now until find a fix for component length max being 25
            // const channels: MessageSelectOptionData[] = (await interaction.guild.channels.fetch())
            //     .map(channel => {
            //         if (channel.type === 'GUILD_TEXT')
            //             return <MessageSelectOptionData>{ label: `#${channel.name}`, value: channel.id };
            //         else return <MessageSelectOptionData>{};
            //     })
            //     .filter(x => {
            //         if (Object.keys(x).length === 0) return false;
            //         else return true;
            //     });
            try {
                await interaction.reply({
                    embeds: [
                        {
                            author: {
                                name: 'Log Channel!',
                                iconURL: client.user.defaultAvatarURL,
                            },
                            description:
                                '**Please respond with the channel you wish to send logs to!**\nEg; `#warden-logs`',
                            color: Colours.GREEN,
                        },
                    ],
                });

                const filter = (m: Message) => {
                    return (
                        m.author.id === interaction.user.id && m.member.permissions.has('ADMINISTRATOR')
                    );
                };

                await interaction.channel
                    .awaitMessages({ filter, time: 60000, max: 1 })
                    .then(async m => {
                        const mentions = m.first().mentions.channels;
                        m.first()
                            .delete()
                            .catch(() => console.log('unable to delete message'));
                        if (mentions.size === 1) {
                            await client.db.guild.update({
                                where: { id: message.guildId },
                                data: { logchan: mentions.first().id },
                            });
                        }
                        interaction.deleteReply();
                    })
                    .catch(err => console.log(err));
            } catch (e) {
                console.log(e);
                await interaction.reply({
                    embeds: [
                        {
                            description:
                                'This interaction has failed, please make sure you have channels, if you do report this in the Warden Discord',
                            color: Colours.RED,
                        },
                    ],
                });
            }
            break;
        }
    }

    client.config.sendConfigMenu(interaction as unknown as BaseCommandInteraction);

    if (!interaction.deferred && !interaction.replied) return await interaction.deferUpdate();
    else return;
}
