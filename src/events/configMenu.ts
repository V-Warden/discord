import {
    BaseCommandInteraction,
    ButtonInteraction,
    MessageActionRow,
    MessageSelectOptionData,
    SelectMenuInteraction,
} from 'discord.js';
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
            const channels: MessageSelectOptionData[] = (await interaction.guild.channels.fetch())
                .map(channel => {
                    if (channel.type === 'GUILD_TEXT')
                        return <MessageSelectOptionData>{ label: `#${channel.name}`, value: channel.id };
                    else return <MessageSelectOptionData>{};
                })
                .filter(x => {
                    if (Object.keys(x).length === 0) return false;
                    else return true;
                });

            try {
                await interaction.reply({
                    embeds: [
                        {
                            author: {
                                name: 'Log Channel!',
                                iconURL: client.user.defaultAvatarURL,
                            },
                            description:
                                '**Select a channel from the menu to send all Warden Logs to!**',
                            color: Colours.GREEN,
                        },
                    ],
                    components: [
                        new MessageActionRow().addComponents([
                            {
                                type: 'SELECT_MENU',
                                customId: 'CONFIG_LOG_CHANNEL',
                                placeholder: 'Nothing selected',
                                options: channels,
                            },
                        ]),
                    ],
                });

                const filter = (i: SelectMenuInteraction) => {
                    return i.user.id === interaction.user.id && i.memberPermissions.has('ADMINISTRATOR');
                };

                let logChannel;
                await interaction.channel
                    .awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 })
                    .then(async i => {
                        logChannel = i.values[0];
                        const message = await i.channel.messages.fetch(i.message.id);
                        message.delete();
                    })
                    .catch(err => console.log(err));

                await client.db.guild.update({
                    where: { id: message.guildId },
                    data: { logchan: logChannel },
                });
            } catch {
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
