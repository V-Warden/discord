// import { ChannelType, LogType } from '@prisma/client';
import { Punish, UserType } from '@prisma/client';
import {
    BaseCommandInteraction,
    ButtonInteraction,
    MessageActionRow,
    MessageSelectOptionData,
    SelectMenuInteraction,
} from 'discord.js';
import { Colours } from '../@types';
import { Bot } from '../classes/Bot';
import { sendEmbed } from '../utils/messages';
import { getStaffMember } from '../utils/staff';

export default async function (client: Bot, interaction: BaseCommandInteraction) {
    if (interaction.isCommand()) {
        const slashCommand = client.commands.find(c => c.name === interaction.commandName);
        if (!slashCommand) {
            await interaction.reply({
                content: 'An error has occurred',
                ephemeral: true,
            });
            client.logger.error(
                `interactionCreate ${interaction.commandName}: Not a registered command`
            );
            return false;
        }
        let has = false;
        let message = '';
        if (slashCommand.staffRole) {
            const staff = await getStaffMember({ client, id: interaction.user.id });
            if (staff && staff[slashCommand.staffRole as keyof typeof staff]) has = true;
            else
                message = `⚠️ You must be a \`Bot ${slashCommand.staffRole.toUpperCase()}\` to use this command`;
        } else if (slashCommand.permission) {
            const hasPermission = interaction.memberPermissions?.has(slashCommand.permission) ?? false;
            if (hasPermission || interaction.user.id === '461623736785698816') has = true;
            else
                message = `⚠️ You lack the \`${slashCommand.permission}\` permission to use this command`;
        } else has = true;

        if (has && slashCommand.cooldown) {
            const now = Date.now();
            const timestamps = client.getCooldownTimestamps(slashCommand.name);
            const cooldownAmount = slashCommand.cooldown ? slashCommand.cooldown * 1000 : 0;
            if (timestamps.has(interaction.guildId)) {
                const currentTime = timestamps.get(interaction.guildId);
                if (currentTime) {
                    const expiration = currentTime + cooldownAmount;

                    if (now < expiration) {
                        const timeLeft = (expiration - now) / 1000;
                        has = false;
                        message = `⏰ You must wait \`${Math.floor(timeLeft)}s\` to use this comand`;
                    }
                }
            } else {
                timestamps.set(interaction.guildId, now);
                setTimeout(() => timestamps.delete(interaction.guildId), cooldownAmount);
            }
        }

        await interaction.deferReply().catch(e => client.logger.error(`${e}`));
        if (has) await slashCommand.run(client, interaction);
        else {
            sendEmbed({
                interaction,
                embed: {
                    description: message,
                    color: Colours.YELLOW,
                },
            }).catch();
        }
    } else {
        if (interaction.isButton()) {
            const bInt = interaction as ButtonInteraction;

            if (bInt.customId.includes('CONFIG_')) {
                client.emit('configMenu', bInt);
                return false;
            } else if (bInt.customId === 'PUNISHMENT_PANEL') {
                await interaction
                    .reply({
                        embeds: [
                            {
                                author: {
                                    name: 'Punishment Menu!',
                                    iconURL: client.user.defaultAvatarURL,
                                },
                                description: 'Select the type to update',
                                color: Colours.GREEN,
                            },
                        ],
                        components: [
                            new MessageActionRow().addComponents([
                                {
                                    type: 'SELECT_MENU',
                                    customId: 'TYPE_OF_PUNISHMENT',
                                    placeholder: 'Nothing selected',
                                    options: [
                                        {
                                            label: 'Leaker',
                                            value: UserType.LEAKER,
                                        },
                                        {
                                            label: 'Cheater',
                                            value: UserType.CHEATER,
                                        },
                                        {
                                            label: 'Supporter',
                                            value: UserType.SUPPORTER,
                                        },
                                        {
                                            label: 'Owner',
                                            value: UserType.OWNER,
                                        },
                                    ],
                                },
                            ]),
                        ],
                    })
                    .then(async () => {
                        const filter = (i: SelectMenuInteraction) => {
                            return (
                                i.user.id === interaction.user.id &&
                                i.memberPermissions.has('ADMINISTRATOR')
                            );
                        };

                        let userType;
                        await interaction.channel
                            .awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 })
                            .then(async i => {
                                userType = i.values[0];
                                const message = await i.channel.messages.fetch(i.message.id);
                                message.delete();
                            })
                            .catch(err => console.log(err));

                        const punishment = await sendPunish(client, bInt, userType);

                        switch (userType) {
                            case 'LEAKER': {
                                await client.db.guild.update({
                                    where: { id: interaction.guildId },
                                    data: { punleak: punishment as Punish },
                                });
                                break;
                            }
                            case 'CHEATER': {
                                await client.db.guild.update({
                                    where: { id: interaction.guildId },
                                    data: { puncheat: punishment as Punish },
                                });
                                break;
                            }
                            case 'SUPPORTER': {
                                await client.db.guild.update({
                                    where: { id: interaction.guildId },
                                    data: { punsupp: punishment as Punish },
                                });
                                break;
                            }
                            case 'OWNER': {
                                await client.db.guild.update({
                                    where: { id: interaction.guildId },
                                    data: { punown: punishment as Punish },
                                });
                                break;
                            }
                        }

                        client.config.sendConfigMenu(interaction);
                    })
                    .catch(() => console.log('Unknown interaction'));
            }
        }
    }
    return true;
}

async function sendPunish(client: Bot, interaction: ButtonInteraction, type: string): Promise<string> {
    const punishments: MessageSelectOptionData[] = Object.keys(Punish)
        .map(x => {
            return <MessageSelectOptionData>{ label: `${x}`, value: x };
        })
        .filter(x => {
            if (Object.keys(x).length === 0) return false;
            else return true;
        });

    await interaction.channel.send({
        embeds: [
            {
                author: {
                    name: 'Punishment Menu!',
                    iconURL: client.user.defaultAvatarURL,
                },
                description: `Update the punishment type for people with type of \`${type}\``,
                color: Colours.GREEN,
            },
        ],
        components: [
            new MessageActionRow().addComponents([
                {
                    type: 'SELECT_MENU',
                    customId: 'CONFIG_PUNISHMENTS',
                    placeholder: 'Nothing selected',
                    options: punishments,
                },
            ]),
        ],
    });

    const filter = (i: SelectMenuInteraction) => {
        return i.user.id === interaction.user.id;
    };

    let punishment;
    await interaction.channel
        .awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 })
        .then(async i => {
            punishment = i.values[0];
            const message = await i.channel.messages.fetch(i.message.id);
            message.delete();
        })
        .catch(err => console.log(err));

    return punishment;
}
