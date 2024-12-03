import {
    ApplicationCommandOptionType,
    ChannelType,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
    ComponentType,
} from 'discord.js'
import { Colours } from '../../@types/Colours'
import { Command } from '../../structures/Command'
import { Punish } from '@prisma/client'
import { sendError } from '../../utils/messages'
import db from '../../utils/database'
import logger from '../../utils/logger'
import sendEmbed from '../../utils/messages/sendEmbed'

export default new Command({
    name: 'config',
    description: 'Adjust this Guilds Settings for Warden',
    defaultMemberPermissions: 'Administrator',
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'view',
            description: 'View settings',
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'settings',
            description: 'Configure settings',
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'punishments',
            description: 'Configure punishments',
        },
    ],
    run: async ({ interaction, client }) => {
        const subCommand = interaction.options.getSubcommand()

        if (subCommand === 'view') {
            // view settings
            await interaction.deferReply()

            const guild = await db.getGuild(
                { id: interaction?.guild?.id },
                { punishments: true, logChannel: true }
            )

            if (!guild || !guild.punishments)
                return sendError(interaction, 'This guild is not registered, please raise a support ticket')

            logger.info({
                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: `${interaction?.user?.tag} (${interaction?.user?.id}) viewed settings`,
            })

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
                            value: `Status: \`${guild.punishments?.enabled ? 'Enabled' : 'Disabled'}\`\n> This determins if the bot will have functionality on this guild.\nUse the command \`/config settings\` to change this.`,
                        },
                        {
                            name: 'Log Channel',
                            value: `Channel: <#${guild.logChannel}>\n> A text channel where all bot logs are sent to.\nUse the command \`/config settings\` to change this.`,
                        },
                        {
                            name: 'Unban',
                            value: `Status: \`${guild.punishments?.unban ? 'Enabled' : 'Disabled'}\`\n> This will automatically unban a user when appealed, if they are banned via Warden.\nUse the command \`/config settings\` to change this.`,
                        },
                        {
                            name: 'Global Scan',
                            value: `Status: \`${guild.punishments?.globalCheck ? 'Enabled' : 'Disabled'}\`\n> You can opt in or out of global scanning, you will have to use scanusers if this is disabled.\nUse the command \`/config settings\` to change this.`,
                        },
                        {
                            name: 'Punishment Role',
                            value: `Role: ${guild.punishments.roleId ? `<@&${guild.punishments.roleId}>` : '`Not Set`'}\n> Set a role that a blacklisted user recieves, they will gain all roles back after being appealed.\nUse the command \`/config settings\` to change this.`,
                        },
                        {
                            name: 'Punishments',
                            inline: false,
                            value: `Other -> \`${guild.punishments?.other}\`\nLeaker -> \`${guild.punishments?.leaker}\`\nCheater -> \`${guild.punishments?.cheater}\`\nSupporter -> \`${guild.punishments?.supporter}\`\nOwner -> \`${guild.punishments?.owner}\`\nUse the command \`/config punishments\` to change this.`,
                        },
                    ],
                    color: Colours.BLUE,
                },
            })
        } else if (subCommand === 'settings') {
            // configure settings

            const currentSettingsRows = async (guild: any): Promise<ActionRowBuilder<MessageActionRowComponentBuilder>[]> => {
                const currentSettings = {
                    actioning: guild.punishments.enabled,
                    logChannel: guild.logChannel,
                    unban: guild.punishments.unban,
                    globalScan: guild.punishments.globalCheck,
                    roleId: guild.punishments.roleId,
                }

                const selectActioning = new StringSelectMenuBuilder()
                    .setCustomId('config_actioning')
                    .setPlaceholder('Select an option')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Enabled')
                            .setDescription('Enable the bot')
                            .setValue('true')
                            .setDefault(currentSettings.actioning),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Disabled')
                            .setDescription('Disable the bot')
                            .setValue('false')
                            .setDefault(!currentSettings.actioning)
                    )

                const selectLogChannel = new ChannelSelectMenuBuilder()
                    .setCustomId('config_logchannel')
                    .setPlaceholder('Select a channel')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addChannelTypes(ChannelType.GuildText)
                    .addDefaultChannels(currentSettings.logChannel ? [currentSettings.logChannel] : [])

                const unbanSelect = new StringSelectMenuBuilder()
                    .setCustomId('config_unban')
                    .setPlaceholder('Select an option')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Enabled')
                            .setDescription('Enable automatic unbanning')
                            .setValue('true')
                            .setDefault(currentSettings.unban),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Disabled')
                            .setDescription('Disable automatic unbanning')
                            .setValue('false')
                            .setDefault(!currentSettings.unban)
                    )

                const selectGlobalScan = new StringSelectMenuBuilder()
                    .setCustomId('config_globalscan')
                    .setPlaceholder('Select an option')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Enabled')
                            .setDescription('Enable global scanning')
                            .setValue('true')
                            .setDefault(currentSettings.globalScan),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Disabled')
                            .setDescription('Disable global scanning')
                            .setValue('false')
                            .setDefault(!currentSettings.globalScan)
                    )

                const selectPunishRole = new RoleSelectMenuBuilder()
                    .setCustomId('config_punishrole')
                    .setPlaceholder('Select role.')
                    .setMinValues(0)
                    .setMaxValues(1)
                    .addDefaultRoles(currentSettings.roleId ? [currentSettings.roleId] : [])

                const rows = [
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectActioning),
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectLogChannel),
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(unbanSelect),
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectGlobalScan),
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectPunishRole),
                ]

                return rows
            }

            const currentEmbedSettings = async (guild: any) => {
                const currentSettings = {
                    actioning: guild.punishments.enabled,
                    logChannel: guild.logChannel,
                    unban: guild.punishments.unban,
                    globalScan: guild.punishments.globalCheck,
                    roleId: guild.punishments.roleId,
                }

                const embedSettings = new EmbedBuilder()
                    .setTitle('Settings')
                    .setDescription(
                        `**Configure the bot settings below:**\n> It is recommended to have actioning enabled.\n
                        **Actioning:** \`${currentSettings.actioning ? 'Enabled' : 'Disabled'}\`\n> This determines if the bot will have functionality on this guild.\n
                        **Log Channel:** <#${currentSettings.logChannel}>\n> A text channel where all bot logs are sent to.\n
                        **Unban:** \`${currentSettings.unban ? 'Enabled' : 'Disabled'}\`\n> This will automatically unban a user when appealed, if they are banned via Warden.\n
                        **Global Scan:** \`${currentSettings.globalScan ? 'Enabled' : 'Disabled'}\`\n> You can opt in or out of global scanning, you will have to use scanusers if this is disabled.\n
                        **Punishment Role:** ${currentSettings.roleId ? `<@&${currentSettings.roleId}>` : '`Not Set`'}\n> Set a role that a blacklisted user receives, they will gain all roles back after being appealed.\n
                        **The select menus below are in the order from above.**`
                    )
                    .setColor(Colours.BLUE)

                return embedSettings
            }

            const guild = await db.getGuild(
                { id: interaction?.guild?.id },
                { punishments: true, logChannel: true }
            )

            if (!guild || !guild.punishments)
                return sendError(interaction, 'This guild is not registered, please raise a support ticket')

            const rowsSettings = await currentSettingsRows(guild) || []

            const replySettings = await interaction.reply({
                embeds: [await currentEmbedSettings(guild)],
                components: rowsSettings.length ? [rowsSettings[0], rowsSettings[1], rowsSettings[2], rowsSettings[3], rowsSettings[4]] : [],
                ephemeral: true,
            }).catch(e => {
                sendError(interaction, 'An error occured, please try again later.')

                logger.error({
                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                })
            })

            if (!replySettings) return

            const collectorStringSelect = replySettings.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: (i) => i?.user?.id === interaction?.user?.id,
                time: 600000,
            })

            const collectorChannelSelect = replySettings.createMessageComponentCollector({
                componentType: ComponentType.ChannelSelect,
                filter: (i) => i?.user?.id === interaction?.user?.id,
                time: 600000,
            })

            const collectorRoleSelect = replySettings.createMessageComponentCollector({
                componentType: ComponentType.RoleSelect,
                filter: (i) => i?.user?.id === interaction?.user?.id,
                time: 600000,
            })

            const updateCurrentSettings = async () => {
                const guild = await db.getGuild(
                    { id: interaction?.guild?.id },
                    { punishments: true, logChannel: true }
                )

                if (!guild || !guild.punishments)
                    return sendError(interaction, 'This guild is not registered, please raise a support ticket')

                const rows = await currentSettingsRows(guild) || []

                return await replySettings.edit({
                    embeds: [await currentEmbedSettings(guild)],
                    components: rows.length ? [rows[0], rows[1], rows[2], rows[3], rows[4]] : [],
                }).catch(e => {
                    sendError(interaction, 'An error occured, please try again later.')

                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                })
            }

            collectorStringSelect.on('collect', async (interaction) => {
                if (interaction.customId === 'config_actioning') {
                    const embedError = new EmbedBuilder()
                        .setDescription(`\`🔴\` Actioning is empty.`)
                        .setColor(Colours.RED)

                    if (!interaction.values.length) {
                        await interaction.reply({
                            embeds: [embedError],
                            ephemeral: true,
                        }).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                        })
                        return
                    }

                    const selected = interaction.values[0]

                    const embedWarn = new EmbedBuilder()
                        .setDescription(`\`🟡\` Actioning not found.`)
                        .setColor(Colours.YELLOW)

                    if (selected) {
                        await db.updatePunishments({ id: interaction?.guild?.id }, { enabled: JSON.parse(selected) })
                        await updateCurrentSettings()
                        await interaction.deferUpdate().catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                        })
                        return
                    } else {
                        await interaction.reply(
                            {
                                embeds: [embedWarn],
                                ephemeral: true,
                            }
                        ).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                        })
                        return
                    }
                } else if (interaction.customId === 'config_unban') {
                    const embedError = new EmbedBuilder()
                        .setDescription(`\`🔴\` Unban is empty.`)
                        .setColor(Colours.RED)

                    if (!interaction.values.length) {
                        await interaction.reply({
                            embeds: [embedError],
                            ephemeral: true,
                        }).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                        })
                        return
                    }

                    const selected = interaction.values[0]

                    const embedWarn = new EmbedBuilder()
                        .setDescription(`\`🟡\` Unban not found.`)
                        .setColor(Colours.YELLOW)

                    if (selected) {
                        await db.updatePunishments({ id: interaction?.guild?.id }, { unban: JSON.parse(selected) })
                        await updateCurrentSettings()
                        await interaction.deferUpdate().catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                        })
                        return
                    } else {
                        await interaction.reply(
                            {
                                embeds: [embedWarn],
                                ephemeral: true,
                            }
                        ).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                        })
                        return
                    }
                } else if (interaction.customId === 'config_globalscan') {
                    const embedError = new EmbedBuilder()
                        .setDescription(`\`🔴\` Global Scan is empty.`)
                        .setColor(Colours.RED)

                    if (!interaction.values.length) {
                        await interaction.reply({
                            embeds: [embedError],
                            ephemeral: true,
                        }).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                        })
                        return
                    }

                    const selected = interaction.values[0]

                    const embedWarn = new EmbedBuilder()
                        .setDescription(`\`🟡\` Global Scan not found.`)
                        .setColor(Colours.YELLOW)

                    if (selected) {
                        await db.updatePunishments({ id: interaction?.guild?.id }, { globalCheck: JSON.parse(selected) })
                        await updateCurrentSettings()
                        await interaction.deferUpdate().catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                        })
                        return
                    } else {
                        await interaction.reply(
                            {
                                embeds: [embedWarn],
                                ephemeral: true,
                            }
                        ).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                        })
                        return
                    }
                }
            })

            collectorChannelSelect.on('collect', async (interaction) => {
                if (interaction.customId === 'config_logchannel') {
                    const embedError = new EmbedBuilder()
                        .setDescription(`\`🔴\` Log Channel is empty.`)
                        .setColor(Colours.RED)

                    if (!interaction.values.length) {
                        await interaction.reply({
                            embeds: [embedError],
                            ephemeral: true,
                        }).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    }

                    const selected = interaction.values[0]

                    const embedWarn = new EmbedBuilder()
                        .setDescription(`\`🟡\` Log Channel not found.`)
                        .setColor(Colours.YELLOW)

                    if (selected) {
                        await db.updateGuild({ id: interaction?.guild?.id }, { logChannel: selected })
                        await updateCurrentSettings()
                        await interaction.deferUpdate().catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                        })
                        return
                    } else {
                        await interaction.reply(
                            {
                                embeds: [embedWarn],
                                ephemeral: true,
                            }
                        ).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    }
                }
            })

            collectorRoleSelect.on('collect', async (interaction) => {
                if (interaction.customId === 'config_punishrole') {
                    const selected = interaction.values[0]

                    if (selected) {
                        await db.updatePunishments({ id: interaction?.guild?.id }, { roleId: selected })
                        await updateCurrentSettings()
                        await interaction.deferUpdate().catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    } else {
                        await db.updatePunishments({ id: interaction?.guild?.id }, { roleId: null })
                        await updateCurrentSettings()
                        await interaction.deferUpdate().catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    }
                }
            })

            return
        } else if (subCommand === 'punishments') {
            // configure punishments

            const currentPunishmentRows = async (guild: any): Promise<ActionRowBuilder<MessageActionRowComponentBuilder>[]> => {
                const currentSettings = {
                    other: guild.punishments.other,
                    leaker: guild.punishments.leaker,
                    cheater: guild.punishments.cheater,
                    supporter: guild.punishments.supporter,
                    owner: guild.punishments.owner,
                }

                const selectPunishOther = new StringSelectMenuBuilder()
                    .setCustomId('config_punish_other')
                    .setPlaceholder('Select an option')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Warn')
                            .setDescription('For type other')
                            .setValue('WARN')
                            .setDefault(currentSettings.other === 'WARN'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Ban')
                            .setDescription('For type other')
                            .setValue('BAN')
                            .setDefault(currentSettings.other === 'BAN'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Kick')
                            .setDescription('For type other')
                            .setValue('KICK')
                            .setDefault(currentSettings.other === 'KICK'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Role')
                            .setDescription('For type other')
                            .setValue('ROLE')
                            .setDefault(currentSettings.other === 'ROLE')
                    )

                const selectPunishLeaker = new StringSelectMenuBuilder()
                    .setCustomId('config_punish_leaker')
                    .setPlaceholder('Select an option')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Warn')
                            .setDescription('For type leaker')
                            .setValue('WARN')
                            .setDefault(currentSettings.leaker === 'WARN'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Ban')
                            .setDescription('For type leaker')
                            .setValue('BAN')
                            .setDefault(currentSettings.leaker === 'BAN'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Kick')
                            .setDescription('For type leaker')
                            .setValue('KICK')
                            .setDefault(currentSettings.leaker === 'KICK'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Role')
                            .setDescription('For type leaker')
                            .setValue('ROLE')
                            .setDefault(currentSettings.leaker === 'ROLE')
                    )

                const selectPunishCheater = new StringSelectMenuBuilder()
                    .setCustomId('config_punish_cheater')
                    .setPlaceholder('Select an option')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Warn')
                            .setDescription('For type cheater')
                            .setValue('WARN')
                            .setDefault(currentSettings.cheater === 'WARN'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Ban')
                            .setDescription('For type cheater')
                            .setValue('BAN')
                            .setDefault(currentSettings.cheater === 'BAN'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Kick')
                            .setDescription('For type cheater')
                            .setValue('KICK')
                            .setDefault(currentSettings.cheater === 'KICK'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Role')
                            .setDescription('For type cheater')
                            .setValue('ROLE')
                            .setDefault(currentSettings.cheater === 'ROLE')
                    )

                const selectPunishSupporter = new StringSelectMenuBuilder()
                    .setCustomId('config_punish_supporter')
                    .setPlaceholder('Select an option')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Warn')
                            .setDescription('For type supporter')
                            .setValue('WARN')
                            .setDefault(currentSettings.supporter === 'WARN'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Ban')
                            .setDescription('For type supporter')
                            .setValue('BAN')
                            .setDefault(currentSettings.supporter === 'BAN'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Kick')
                            .setDescription('For type supporter')
                            .setValue('KICK')
                            .setDefault(currentSettings.supporter === 'KICK'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Role')
                            .setDescription('For type supporter')
                            .setValue('ROLE')
                            .setDefault(currentSettings.supporter === 'ROLE')
                    )

                const selectPunishOwner = new StringSelectMenuBuilder()
                    .setCustomId('config_punish_owner')
                    .setPlaceholder('Select an option')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Warn')
                            .setDescription('For type owner')
                            .setValue('WARN')
                            .setDefault(currentSettings.owner === 'WARN'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Ban')
                            .setDescription('For type owner')
                            .setValue('BAN')
                            .setDefault(currentSettings.owner === 'BAN'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Kick')
                            .setDescription('For type owner')
                            .setValue('KICK')
                            .setDefault(currentSettings.owner === 'KICK'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Role')
                            .setDescription('For type owner')
                            .setValue('ROLE')
                            .setDefault(currentSettings.owner === 'ROLE')
                    )

                const rows = [
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectPunishOther),
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectPunishLeaker),
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectPunishCheater),
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectPunishSupporter),
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectPunishOwner),
                ]

                return rows
            }

            const currentEmbedPunishments = async (guild: any) => {
                const currentSettings = {
                    other: guild.punishments.other,
                    leaker: guild.punishments.leaker,
                    cheater: guild.punishments.cheater,
                    supporter: guild.punishments.supporter,
                    owner: guild.punishments.owner,
                }

                const embedSettings = new EmbedBuilder()
                    .setTitle('Settings')
                    .setDescription(
                        `**Other:** \`${currentSettings.other}\`\n> This is the punishment for the type other.\n
                        **Leaker:** \`${currentSettings.leaker}\`\n> This is the punishment for the type leaker.\n
                        **Cheater:** \`${currentSettings.cheater}\`\n> This is the punishment for the type cheater.\n
                        **Supporter:** \`${currentSettings.supporter}\`\n> This is the punishment for the type supporter.\n
                        **Owner:** \`${currentSettings.owner}\`\n> This is the punishment for the type owner.`
                    )
                    .setColor(Colours.BLUE)

                return embedSettings
            }

            const guild = await db.getGuild(
                { id: interaction?.guild?.id },
                { punishments: true, logChannel: true }
            )

            if (!guild || !guild.punishments)
                return sendError(interaction, 'This guild is not registered, please raise a support ticket')

            const rowsPunishments = await currentPunishmentRows(guild) || []

            const replyPunishments = await interaction.reply({
                embeds: [await currentEmbedPunishments(guild)],
                components: rowsPunishments.length ? [rowsPunishments[0], rowsPunishments[1], rowsPunishments[2], rowsPunishments[3], rowsPunishments[4]] : [],
                ephemeral: true,
            }).catch(e => {
                sendError(interaction, 'An error occured, please try again later.')

                logger.error({
                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                })
            })

            if (!replyPunishments) return

            const collectorStringSelect = replyPunishments.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: (i) => i?.user?.id === interaction?.user?.id,
                time: 600000,
            })

            const updateCurrentPunishments = async () => {
                const guild = await db.getGuild(
                    { id: interaction?.guild?.id },
                    { punishments: true, logChannel: true }
                )

                if (!guild || !guild.punishments)
                    return sendError(interaction, 'This guild is not registered, please raise a support ticket')

                const rows = await currentPunishmentRows(guild) || []

                return await replyPunishments.edit({
                    embeds: [await currentEmbedPunishments(guild)],
                    components: rows.length ? [rows[0], rows[1], rows[2], rows[3], rows[4]] : [],
                }).catch(e => {
                    sendError(interaction, 'An error occured, please try again later.')

                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                })
            }

            collectorStringSelect.on('collect', async (interaction) => {
                if (interaction.customId === 'config_punish_other') {
                    const embedError = new EmbedBuilder()
                        .setDescription(`\`🔴\` Other is empty.`)
                        .setColor(Colours.RED)

                    if (!interaction.values.length) {
                        await interaction.reply({
                            embeds: [embedError],
                            ephemeral: true,
                        }).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    }

                    const selected = interaction.values[0]

                    const embedWarn = new EmbedBuilder()
                        .setDescription(`\`🟡\` Other not found.`)
                        .setColor(Colours.YELLOW)

                    if (selected) {
                        await db.updatePunishments({ id: interaction?.guild?.id }, { other: selected as Punish })
                        await updateCurrentPunishments()
                        await interaction.deferUpdate().catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    } else {
                        await interaction.reply(
                            {
                                embeds: [embedWarn],
                                ephemeral: true,
                            }
                        ).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    }
                } else if (interaction.customId === 'config_punish_leaker') {
                    const embedError = new EmbedBuilder()
                        .setDescription(`\`🔴\` Leaker is empty.`)
                        .setColor(Colours.RED)

                    if (!interaction.values.length) {
                        await interaction.reply({
                            embeds: [embedError],
                            ephemeral: true,
                        }).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    }

                    const selected = interaction.values[0]

                    const embedWarn = new EmbedBuilder()
                        .setDescription(`\`🟡\` Leaker not found.`)
                        .setColor(Colours.YELLOW)

                    if (selected) {
                        await db.updatePunishments({ id: interaction?.guild?.id }, { leaker: selected as Punish })
                        await updateCurrentPunishments()
                        await interaction.deferUpdate().catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    } else {
                        await interaction.reply(
                            {
                                embeds: [embedWarn],
                                ephemeral: true,
                            }
                        ).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    }
                } else if (interaction.customId === 'config_punish_cheater') {
                    const embedError = new EmbedBuilder()
                        .setDescription(`\`🔴\` Cheater is empty.`)
                        .setColor(Colours.RED)

                    if (!interaction.values.length) {
                        await interaction.reply({
                            embeds: [embedError],
                            ephemeral: true,
                        }).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    }

                    const selected = interaction.values[0]

                    const embedWarn = new EmbedBuilder()
                        .setDescription(`\`🟡\` Cheater not found.`)
                        .setColor(Colours.YELLOW)

                    if (selected) {
                        await db.updatePunishments({ id: interaction?.guild?.id }, { cheater: selected as Punish })
                        await updateCurrentPunishments()
                        await interaction.deferUpdate().catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    } else {
                        await interaction.reply(
                            {
                                embeds: [embedWarn],
                                ephemeral: true,
                            }
                        ).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    }
                } else if (interaction.customId === 'config_punish_supporter') {
                    const embedError = new EmbedBuilder()
                        .setDescription(`\`🔴\` Supporter is empty.`)
                        .setColor(Colours.RED)

                    if (!interaction.values.length) {
                        await interaction.reply({
                            embeds: [embedError],
                            ephemeral: true,
                        }).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    }

                    const selected = interaction.values[0]

                    const embedWarn = new EmbedBuilder()
                        .setDescription(`\`🟡\` Supporter not found.`)
                        .setColor(Colours.YELLOW)

                    if (selected) {
                        await db.updatePunishments({ id: interaction?.guild?.id }, { supporter: selected as Punish })
                        await updateCurrentPunishments()
                        await interaction.deferUpdate().catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    } else {
                        await interaction.reply(
                            {
                                embeds: [embedWarn],
                                ephemeral: true,
                            }
                        ).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    }
                } else if (interaction.customId === 'config_punish_owner') {
                    const embedError = new EmbedBuilder()
                        .setDescription(`\`🔴\` Owner is empty.`)
                        .setColor(Colours.RED)

                    if (!interaction.values.length) {
                        await interaction.reply({
                            embeds: [embedError],
                            ephemeral: true,
                        }).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    }

                    const selected = interaction.values[0]

                    const embedWarn = new EmbedBuilder()
                        .setDescription(`\`🟡\` Owner not found.`)
                        .setColor(Colours.YELLOW)

                    if (selected) {
                        await db.updatePunishments({ id: interaction?.guild?.id }, { owner: selected as Punish })
                        await updateCurrentPunishments()
                        await interaction.deferUpdate().catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    } else {
                        await interaction.reply(
                            {
                                embeds: [embedWarn],
                                ephemeral: true,
                            }
                        ).catch(e => {
                            logger.error({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: e instanceof Error ? e.message : JSON.stringify(e),
                            })
                            return
                        })
                        return
                    }
                }
            })

            return
        }

        return
    }
})
