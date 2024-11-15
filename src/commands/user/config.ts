import { ApplicationCommandOptionType, ChannelType } from 'discord.js';
import { capitalize, mapAnyType } from '../../utils/misc';
import { Colours } from '../../@types/Colours';
import { Command } from '../../structures/Command';
import { Punish, UserType } from '@prisma/client';
import { sendError, sendSuccess } from '../../utils/messages';
import db from '../../utils/database';
import logger from '../../utils/logger';
import sendEmbed from '../../utils/messages/sendEmbed';

export default new Command({
    name: 'config',
    description: 'Adjust this Guilds Settings for Warden',
    defaultMemberPermissions: 'Administrator',
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'settings',
            description: 'View bot settings',
        },
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: 'set',
            description: 'Set a setting',
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: 'log',
                    description: 'Specify a channel to send bot logs to',
                    options: [
                        {
                            type: ApplicationCommandOptionType.Channel,
                            name: 'value',
                            description: 'Channel',
                            required: true,
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: 'punishrole',
                    description: 'Specify a role to be given to users',
                    options: [
                        {
                            type: ApplicationCommandOptionType.Role,
                            name: 'role',
                            description: 'Role or ID',
                            required: true,
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: 'action',
                    description: 'Set an action for a user type',
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: 'type',
                            description: 'User Type',
                            choices: mapAnyType(UserType),
                            required: true,
                        },
                        {
                            type: ApplicationCommandOptionType.String,
                            name: 'punish',
                            description: 'Punishment',
                            choices: mapAnyType(Punish),
                            required: true,
                        },
                    ],
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: 'toggle',
            description: 'Toggle a setting',
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: 'actioning',
                    description: 'Toggle actioning for the bot',
                    options: [
                        {
                            type: ApplicationCommandOptionType.Boolean,
                            name: 'value',
                            description: 'True/False',
                            required: true,
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: 'globalscan',
                    description: 'Toggle global scanning',
                    options: [
                        {
                            type: ApplicationCommandOptionType.Boolean,
                            name: 'value',
                            description: 'True/False',
                            required: true,
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: 'unban',
                    description: 'Toggle unbanning',
                    options: [
                        {
                            type: ApplicationCommandOptionType.Boolean,
                            name: 'value',
                            description: 'True/False',
                            required: true,
                        },
                    ],
                },
            ],
        },
    ],
    run: async ({ interaction, client }) => {
        const subCommandGroup = interaction.options.getSubcommandGroup();
        const subCommand = interaction.options.getSubcommand();

        if (subCommand === 'settings') {
            // view settings
            const guild = await db.getGuild(
                { id: interaction?.guild?.id },
                { punishments: true, logChannel: true }
            );

            if (!guild || !guild.punishments)
                return sendError(interaction, 'This guild is not registered, please raise a support ticket');

            logger.info({
                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: `${interaction?.user?.tag} viewed settings`,
            });

            return sendEmbed({
                interaction,
                embed: {
                    author: {
                        name: 'Welcome to Warden!',
                        icon_url: client.user?.defaultAvatarURL,
                    },
                    fields: [
                        {
                            name: 'Actioning',
                            value: `Status: \`${
                                guild.punishments?.enabled ? 'Enabled' : 'Disabled'
                            }\`\n> This determins if the bot will have functionality on this guild`,
                        },
                        {
                            name: 'Log Channel',
                            value: `Channel: <#${guild.logChannel}>\n> A text channel where all bot logs are sent to`,
                        },
                        {
                            name: 'Unban',
                            value: `Status: \`${
                                guild.punishments?.unban ? 'Enabled' : 'Disabled'
                            }\`\n> This will automatically unban a user when appealed, if they are banned via Warden`,
                        },
                        {
                            name: 'Global Scan',
                            value: `Status: \`${
                                guild.punishments?.globalCheck ? 'Enabled' : 'Disabled'
                            }\`\n> You can opt in or out of global scanning, you will have to use scanusers if this is disabled`,
                        },
                        {
                            name: 'Punishment Role',
                            value: `Role: ${
                                guild.punishments.roleId ? `<@&${guild.punishments.roleId}>` : '`Not Set`'
                            }\n> Set a role that a blacklisted user recieves, they will gain all roles back after being appealed\n> /config set punishrole`,
                        },
                        {
                            name: 'Punishments',
                            inline: false,
                            value: `Other -> \`${guild.punishments?.other}\`\nLeaker -> \`${guild.punishments?.leaker}\`\nCheater -> \`${guild.punishments?.cheater}\`\nSupporter -> \`${guild.punishments?.supporter}\`\nOwner -> \`${guild.punishments?.owner}\``,
                        },
                    ],
                    color: Colours.GREEN,
                },
            });
        }
        let msg = '';

        switch (subCommandGroup) {
            case 'toggle': {
                const value = interaction.options.getBoolean('value') as boolean;
                if (subCommand === 'actioning') {
                    msg = `Toggled actioning to \`${value}\``;
                    await db.updatePunishments({ id: interaction?.guild?.id }, { enabled: value });
                } else if (subCommand === 'unban') {
                    msg = `Toggled unban to \`${value}\``;
                    await db.updatePunishments({ id: interaction?.guild?.id }, { unban: value });
                } else if (subCommand === 'globalscan') {
                    msg = `Toggled globalscan to \`${value}\``;
                    await db.updatePunishments({ id: interaction?.guild?.id }, { globalCheck: value });
                }
                break;
            }
            case 'set': {
                if (subCommand === 'log') {
                    const value = interaction.options.getChannel('value');
                    if (value?.type !== ChannelType.GuildText)
                        return sendError(interaction, 'Logging channel must be a text channel');

                    await db.updateGuild({ id: interaction?.guild?.id }, { logChannel: value.id });
                    msg = `Successfully updated \`${subCommand}\` to \`${value.name}\`\n> Make sure I have permissions to send messages in here`;
                } else if (subCommand === 'punishrole') {
                    const value = interaction.options.getRole('role');

                    await db.updatePunishments({ id: interaction?.guild?.id }, { roleId: value?.id });
                    msg = `Successfully updated \`${subCommand}\` to \`${value?.name}\`\n> Make sure I have permissions to assign and remove this role`;
                } else if (subCommand === 'action') {
                    const type = interaction.options.getString('type') as UserType;
                    const punish = interaction.options.getString('punish') as Punish;

                    let data = {};
                    if (type === 'CHEATER') {
                        data = { cheater: punish };
                    } else if (type === 'LEAKER') {
                        data = { leaker: punish };
                    } else if (type === 'OTHER') {
                        data = { other: punish };
                    } else if (type === 'OWNER') {
                        data = { owner: punish };
                    } else if (type === 'SUPPORTER') {
                        data = { supporter: punish };
                    }
                    await db.updatePunishments({ id: interaction?.guild?.id }, data);
                    msg = `Successfully updated \`${capitalize(type)}\` to \`${capitalize(punish)}\``;
                }
                break;
            }
        }

        logger.info({
            labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} updated ${subCommandGroup} ${subCommand}`,
        });

        return sendSuccess(interaction, msg);
    },
});
