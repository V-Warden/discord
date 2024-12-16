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
    TextChannel,
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
            name: 'info',
            description: 'Info about the configuration',
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
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'bans',
            description: 'Configure bans',
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'unbans',
            description: 'Configure unbans',
        },
    ],
    run: async ({ interaction, client }) => {
        const subCommand = interaction.options.getSubcommand()

        if (subCommand === 'info') {
            // info
            await interaction.deferReply().catch(e => {
                logger.error({
                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                })
            })

            const guild = await db.getGuild(
                { id: interaction?.guild?.id },
                { punishments: true, logChannel: true }
            )

            if (!guild || !guild.punishments)
                return sendError(interaction, 'This guild is not registered, please raise a support ticket')

            logger.info({
                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: `${interaction?.user?.tag} (${interaction?.user?.id}) viewed info for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
            })

            return sendEmbed({
                interaction,
                embed: {
                    title: 'Warden Configuration',
                    description: `Welcome to the Warden Configuration. Please select a subcommand to view or configure settings.`,
                    fields: [
                        {
                            name: 'Subcommands',
                            value: '`/config settings` - Configure the bot settings\n`/config punishments` - Configure the punishments\n`/config bans` - Configure the bans\n`/config unbans` - Configure the unbans',
                        },
                    ],
                    color: Colours.BLUE,
                },
            })
        } else if (subCommand === 'settings') {
            // configure settings
            const settings = await db.getGuild({ id: interaction?.guild?.id }, { logChannel: true })

            let channel: TextChannel | false

            try {
                channel = (await interaction?.guild?.channels.fetch(settings?.logChannel ?? '')) as TextChannel
            } catch (error) {
                channel = false
            }

            logger.info({
                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: `${interaction?.user?.tag} (${interaction?.user?.id}) opened configured settings for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
            })

            const currentSettingsRows = async (guild: any): Promise<ActionRowBuilder<MessageActionRowComponentBuilder>[]> => {
                const currentSettings = {
                    actioning: guild.punishments.enabled,
                    logChannel: guild.logChannel,
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
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectGlobalScan),
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(selectPunishRole),
                ]

                return rows
            }

            const currentEmbedSettings = async (guild: any) => {
                const currentSettings = {
                    actioning: guild.punishments.enabled,
                    logChannel: guild.logChannel,
                    globalScan: guild.punishments.globalCheck,
                    roleId: guild.punishments.roleId,
                }

                const embedSettings = new EmbedBuilder()
                    .setTitle('Guild Configuration')
                    .setDescription(
                        `**Actioning:** \`${currentSettings.actioning ? 'Enabled' : 'Disabled'}\`\n> Determines if the bot's functionalities are active in this guild.\n
                        **Log Channel:** ${currentSettings.logChannel ? `<#${currentSettings.logChannel}>` : '`Not Set`'}\n> The channel where all bot logs are sent.\n
                        **Global Scan:** \`${currentSettings.globalScan ? 'Enabled' : 'Disabled'}\`\n> Opt in or out of global scanning. If disabled, you will need to use \`scanusers\` manually.\n
                        **Punishment Role:** ${currentSettings.roleId ? `<@&${currentSettings.roleId}>` : '`Not Set`'}\n> The role assigned to blacklisted users while awaiting action (e.g., \`KICK/BAN\`) or punishment (\`ROLE\`). If set to \`ROLE\`, users will regain all roles upon appeal. Configure punishments with \`/config punishments\`.\n
                        **The select menus below correspond to the settings above.**`
                    )
                    .setColor(Colours.BLUE)

                return embedSettings
            }

            const guild = await db.getGuild(
                { id: interaction?.guild?.id },
                { punishments: true, logChannel: true }
            )

            if (!guild || !guild.punishments) return

            const rowsSettings = await currentSettingsRows(guild).catch(e => {
                logger.error({
                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                })

                return []
            })

            const replySettings = await interaction.reply({
                embeds: [await currentEmbedSettings(guild).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                    return {}
                })],
                components: rowsSettings.length ? [rowsSettings[0], rowsSettings[1], rowsSettings[2], rowsSettings[3]] : [],
                ephemeral: true,
            }).catch(e => {
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

                if (!guild || !guild.punishments) return

                const rows = await currentSettingsRows(guild).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })

                    return []
                })

                return await replySettings.edit({
                    embeds: [await currentEmbedSettings(guild).catch(e => {
                        logger.error({
                            labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                            message: e instanceof Error ? e.message : JSON.stringify(e),
                        })
                        return {}
                    })
                    ],
                    components: rows.length ? [rows[0], rows[1], rows[2], rows[3]] : [],
                }).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                })
            }

            if (!channel) {
                interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`\`🟡\` The log channel is not set, please set it before continuing.`)
                            .setColor(Colours.YELLOW),
                    ],
                    ephemeral: true,
                }).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                })
            }

            collectorStringSelect.on('collect', async (interaction) => {
                try {
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
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Actioning has been successfully set to \`${selected}\` by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured settings actioning to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Global Scan has been successfully set to \`${selected}\` by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured settings global scan to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                } catch (error) {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: error instanceof Error ? error.message : JSON.stringify(error),
                    })
                }
            })

            collectorChannelSelect.on('collect', async (interaction) => {
                try {
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
                            try {
                                channel = await interaction.guild?.channels.fetch(selected) as TextChannel
                            } catch (error) {
                                channel = false
                            }
                            await updateCurrentSettings()
                            await interaction.deferUpdate().catch(e => {
                                logger.error({
                                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                    message: e instanceof Error ? e.message : JSON.stringify(e),
                                })
                            })
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Log Channel has been successfully set to <#${selected}> by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured settings log channel to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                } catch (error) {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: error instanceof Error ? error.message : JSON.stringify(error),
                    })
                }
            })

            collectorRoleSelect.on('collect', async (interaction) => {
                try {
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
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Punishment Role has been successfully set to <@&${selected}> by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured settings punishment role to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Punishment Role has been successfully removed by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) removed settings punishment role for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
                            })
                            return
                        }
                    }
                } catch (error) {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: error instanceof Error ? error.message : JSON.stringify(error),
                    })
                }
            })

            return
        } else if (subCommand === 'punishments') {
            // configure punishments
            const settings = await db.getGuild({ id: interaction?.guild?.id }, { logChannel: true })

            let channel: TextChannel | false

            try {
                channel = (await interaction?.guild?.channels.fetch(settings?.logChannel ?? '')) as TextChannel
            } catch (error) {
                channel = false
            }

            if (!channel) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`\`🟡\` The log channel is not set \`/config settings\`, please set it before continuing.`)
                            .setColor(Colours.YELLOW),
                    ],
                    ephemeral: true,
                }).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                })

                return
            }

            logger.info({
                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: `${interaction?.user?.tag} (${interaction?.user?.id}) opened configured punishments for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
            })

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
                    .setTitle('Punishments Configuration')
                    .setDescription(
                        `**Other:** \`${currentSettings.other}\`\n> The punishment for other type.\n
                        **Leaker:** \`${currentSettings.leaker}\`\n> The punishment for leaking type.\n
                        **Cheater:** \`${currentSettings.cheater}\`\n> The punishment for cheating yupe.\n
                        **Supporter:** \`${currentSettings.supporter}\`\n> The punishment for supporting type.\n
                        **Owner:** \`${currentSettings.owner}\`\n> The punishment for owner type.\n
                        **The select menus below correspond to the settings above.**`
                    )
                    .setColor(Colours.BLUE)

                return embedSettings
            }

            const guild = await db.getGuild(
                { id: interaction?.guild?.id },
                { punishments: true, logChannel: true }
            )

            if (!guild || !guild.punishments) return

            const rowsPunishments = await currentPunishmentRows(guild).catch(e => {
                logger.error({
                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                })

                return []
            })

            const replyPunishments = await interaction.reply({
                embeds: [await currentEmbedPunishments(guild).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                    return {}
                })
                ],
                components: rowsPunishments.length ? [rowsPunishments[0], rowsPunishments[1], rowsPunishments[2], rowsPunishments[3], rowsPunishments[4]] : [],
                ephemeral: true,
            }).catch(e => {
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

                if (!guild || !guild.punishments) return


                const rows = await currentPunishmentRows(guild).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })

                    return []
                })

                return await replyPunishments.edit({
                    embeds: [await currentEmbedPunishments(guild).catch(e => {
                        logger.error({
                            labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                            message: e instanceof Error ? e.message : JSON.stringify(e),
                        })
                        return {}
                    })
                    ],
                    components: rows.length ? [rows[0], rows[1], rows[2], rows[3], rows[4]] : [],
                }).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                })
            }

            collectorStringSelect.on('collect', async (interaction) => {
                try {
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
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Other has been successfully set to \`${selected}\` by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured punishments other to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Leaker has been successfully set to \`${selected}\` by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured punishments leaker to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Cheater has been successfully set to \`${selected}\` by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured punishments cheater to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Supporter has been successfully set to \`${selected}\` by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured punishments supporter to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Owner has been successfully set to \`${selected}\` by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured punishments owner to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                } catch (error) {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: error instanceof Error ? error.message : JSON.stringify(error),
                    })
                }
            })

            return
        } else if (subCommand === 'bans') {
            // configure bans
            const settings = await db.getGuild({ id: interaction?.guild?.id }, { logChannel: true })

            let channel: TextChannel | false

            try {
                channel = (await interaction?.guild?.channels.fetch(settings?.logChannel ?? '')) as TextChannel
            } catch (error) {
                channel = false
            }

            if (!channel) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`\`🟡\` The log channel is not set \`/config settings\`, please set it before continuing.`)
                            .setColor(Colours.YELLOW),
                    ],
                    ephemeral: true,
                }).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                })

                return
            }

            logger.info({
                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: `${interaction?.user?.tag} (${interaction?.user?.id}) opened configured bans for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
            })

            const currentBanRows = async (guild: any): Promise<ActionRowBuilder<MessageActionRowComponentBuilder>[]> => {
                const currentBan = {
                    unban: guild.punishments.unban,
                    banAppeal: guild.punishments.banAppeal,
                }

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
                            .setDefault(currentBan.unban),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Disabled')
                            .setDescription('Disable automatic unbanning')
                            .setValue('false')
                            .setDefault(!currentBan.unban)
                    )

                const banAppealSelect = new StringSelectMenuBuilder()
                    .setCustomId('config_ban_appeal')
                    .setPlaceholder('Select an option')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Enabled')
                            .setDescription('Enable banning appealed users')
                            .setValue('true')
                            .setDefault(currentBan.banAppeal),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Disabled')
                            .setDescription('Disable banning appealed users')
                            .setValue('false')
                            .setDefault(!currentBan.banAppeal)
                    )

                const rows = [
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(unbanSelect),
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(banAppealSelect),
                ]

                return rows
            }

            const currentEmbedBan = async (guild: any) => {
                const currentBan = {
                    unban: guild.punishments.unban,
                    banAppeal: guild.punishments.banAppeal,
                }

                const embedSettings = new EmbedBuilder()
                    .setTitle('Ban Configuration')
                    .setDescription(
                        `To apply a ban, set the punishment type to \`BAN\` using \`/config punishments\`.\n
                        **Automatic Unban:** \`${currentBan.unban ? 'Enabled' : 'Disabled'}\`\n> Automatically unban users when their appeal is accepted. This is a global setting. When enabled, you can also configure it for each specific type using \`/config unbans\`.\n
                        **Ban Appealed Users:** \`${currentBan.banAppeal ? 'Enabled' : 'Disabled'}\`\n> Ban users even if their appeal has been accepted, unless automatic unban is enabled. This setting will still apply if unban for a specific type is disabled in \`/config unbans\`. Note: Bans cannot be reversed later by Warden. No DM will be sent. Use this setting with caution!\n
                        **The select menus below correspond to the settings above.**`
                    )
                    .setColor(Colours.BLUE)

                return embedSettings
            }

            const guild = await db.getGuild(
                { id: interaction?.guild?.id },
                { punishments: true, logChannel: true }
            )

            if (!guild || !guild.punishments) return

            const rowsBan = await currentBanRows(guild).catch(e => {
                logger.error({
                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                })

                return []
            })

            const replyBan = await interaction.reply({
                embeds: [await currentEmbedBan(guild).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                    return {}
                })
                ],
                components: rowsBan.length ? [rowsBan[0], rowsBan[1]] : [],
                ephemeral: true,
            }).catch(e => {
                logger.error({
                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                })
            })

            if (!replyBan) return

            const collectorStringSelect = replyBan.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: (i) => i?.user?.id === interaction?.user?.id,
                time: 600000,
            })

            const updateCurrentBan = async () => {
                const guild = await db.getGuild(
                    { id: interaction?.guild?.id },
                    { punishments: true, logChannel: true }
                )

                if (!guild || !guild.punishments) return

                const rows = await currentBanRows(guild).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })

                    return []
                })

                return await replyBan.edit({
                    embeds: [await currentEmbedBan(guild).catch(e => {
                        logger.error({
                            labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                            message: e instanceof Error ? e.message : JSON.stringify(e),
                        })
                        return {}
                    })
                    ],
                    components: rows.length ? [rows[0], rows[1]] : [],
                }).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                })
            }

            collectorStringSelect.on('collect', async (interaction) => {
                try {
                    if (interaction.customId === 'config_unban') {
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
                            await updateCurrentBan()
                            await interaction.deferUpdate().catch(e => {
                                logger.error({
                                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                    message: e instanceof Error ? e.message : JSON.stringify(e),
                                })
                            })
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Unban has been successfully set to \`${selected}\` by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured settings unban to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                    } else if (interaction.customId === 'config_ban_appeal') {
                        const embedError = new EmbedBuilder()
                            .setDescription(`\`🔴\` Ban appeal is empty.`)
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
                            .setDescription(`\`🟡\` Ban appeal not found.`)
                            .setColor(Colours.YELLOW)

                        if (selected) {
                            await db.updatePunishments({ id: interaction?.guild?.id }, { banAppeal: JSON.parse(selected) })
                            await updateCurrentBan()
                            await interaction.deferUpdate().catch(e => {
                                logger.error({
                                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                    message: e instanceof Error ? e.message : JSON.stringify(e),
                                })
                            })
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Ban appeal has been successfully set to \`${selected}\` by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured settings ban appeal to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                } catch (error) {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: error instanceof Error ? error.message : JSON.stringify(error),
                    })
                }
            })
        } else if (subCommand === 'unbans') {
            // configure bans
            const settings = await db.getGuild({ id: interaction?.guild?.id }, { logChannel: true })

            let channel: TextChannel | false

            try {
                channel = (await interaction?.guild?.channels.fetch(settings?.logChannel ?? '')) as TextChannel
            } catch (error) {
                channel = false
            }

            if (!channel) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`\`🟡\` The log channel is not set \`/config settings\`, please set it before continuing.`)
                            .setColor(Colours.YELLOW),
                    ],
                    ephemeral: true,
                }).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                })

                return
            }

            logger.info({
                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                message: `${interaction?.user?.tag} (${interaction?.user?.id}) opened configured bans for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
            })

            const currentUnbanRows = async (guild: any): Promise<ActionRowBuilder<MessageActionRowComponentBuilder>[]> => {
                const currentUnban = {
                    unbanOther: guild.punishments.unbanOther,
                    unbanLeaker: guild.punishments.unbanLeaker,
                    unbanCheater: guild.punishments.unbanCheater,
                    unbanSupporter: guild.punishments.unbanSupporter,
                    unbanOwner: guild.punishments.unbanOwner,
                }

                const unbanOtherSelect = new StringSelectMenuBuilder()
                    .setCustomId('config_unban_other')
                    .setPlaceholder('Select an option')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Enabled')
                            .setDescription('Enable unbanning other type')
                            .setValue('true')
                            .setDefault(currentUnban.unbanOther),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Disabled')
                            .setDescription('Disable unbanning other type')
                            .setValue('false')
                            .setDefault(!currentUnban.unbanOther)
                    )

                const unbanLeakerSelect = new StringSelectMenuBuilder()
                    .setCustomId('config_unban_leaker')
                    .setPlaceholder('Select an option')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Enabled')
                            .setDescription('Enable unbanning leaker type')
                            .setValue('true')
                            .setDefault(currentUnban.unbanLeaker),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Disabled')
                            .setDescription('Disable unbanning leaker type')
                            .setValue('false')
                            .setDefault(!currentUnban.unbanLeaker)
                    )

                const unbanCheaterSelect = new StringSelectMenuBuilder()
                    .setCustomId('config_unban_cheater')
                    .setPlaceholder('Select an option')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Enabled')
                            .setDescription('Enable unbanning cheater type')
                            .setValue('true')
                            .setDefault(currentUnban.unbanCheater),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Disabled')
                            .setDescription('Disable unbanning cheater type')
                            .setValue('false')
                            .setDefault(!currentUnban.unbanCheater)
                    )

                const unbanSupporterSelect = new StringSelectMenuBuilder()
                    .setCustomId('config_unban_supporter')
                    .setPlaceholder('Select an option')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Enabled')
                            .setDescription('Enable unbanning supporter type')
                            .setValue('true')
                            .setDefault(currentUnban.unbanSupporter),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Disabled')
                            .setDescription('Disable unbanning supporter type')
                            .setValue('false')
                            .setDefault(!currentUnban.unbanSupporter)
                    )

                const unbanOwnerSelect = new StringSelectMenuBuilder()
                    .setCustomId('config_unban_owner')
                    .setPlaceholder('Select an option')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Enabled')
                            .setDescription('Enable unbanning owner type')
                            .setValue('true')
                            .setDefault(currentUnban.unbanOwner),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Disabled')
                            .setDescription('Disable unbanning owner type')
                            .setValue('false')
                            .setDefault(!currentUnban.unbanOwner)
                    )

                const rows = [
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(unbanOtherSelect),
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(unbanLeakerSelect),
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(unbanCheaterSelect),
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(unbanSupporterSelect),
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(unbanOwnerSelect),
                ]

                return rows
            }

            const currentEmbedUnban = async (guild: any) => {
                const currentUnban = {
                    unban: guild.punishments.unban,
                    banAppeal: guild.punishments.banAppeal,
                }

                const embedSettings = new EmbedBuilder()
                    .setTitle('Unnan Configuration')
                    .setDescription(
                        `To apply a ban, set the punishment type to \`BAN\` using \`/config punishments\`.\n
                        **The unban settings below are only applied if automatic unban is enabled in \`/config bans\`.**\n
                        **Unban Other:** \`${guild.punishments.unbanOther ? 'Enabled' : 'Disabled'}\`\n> Automatically unban users with the "other" type.\n
                        **Unban Leaker:** \`${guild.punishments.unbanLeaker ? 'Enabled' : 'Disabled'}\`\n> Automatically unban users with the "leaker" type.\n
                        **Unban Cheater:** \`${guild.punishments.unbanCheater ? 'Enabled' : 'Disabled'}\`\n> Automatically unban users with the "cheater" type.\n
                        **Unban Supporter:** \`${guild.punishments.unbanSupporter ? 'Enabled' : 'Disabled'}\`\n> Automatically unban users with the "supporter" type.\n
                        **Unban Owner:** \`${guild.punishments.unbanOwner ? 'Enabled' : 'Disabled'}\`\n> Automatically unban users with the "owner" type.\n
                        **The select menus below correspond to the settings above.**`
                    )
                    .setColor(Colours.BLUE)

                return embedSettings
            }

            const guild = await db.getGuild(
                { id: interaction?.guild?.id },
                { punishments: true, logChannel: true }
            )

            if (!guild || !guild.punishments) return

            const rowsUnban = await currentUnbanRows(guild).catch(e => {
                logger.error({
                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                })

                return []
            })

            const replyUnban = await interaction.reply({
                embeds: [await currentEmbedUnban(guild).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                    return {}
                })
                ],
                components: rowsUnban.length ? [rowsUnban[0], rowsUnban[1], rowsUnban[2], rowsUnban[3], rowsUnban[4]] : [],
                ephemeral: true,
            }).catch(e => {
                logger.error({
                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                    message: e instanceof Error ? e.message : JSON.stringify(e),
                })
            })

            if (!replyUnban) return

            const collectorStringSelect = replyUnban.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: (i) => i?.user?.id === interaction?.user?.id,
                time: 600000,
            })

            const updateCurrentUnban = async () => {
                const guild = await db.getGuild(
                    { id: interaction?.guild?.id },
                    { punishments: true, logChannel: true }
                )

                if (!guild || !guild.punishments) return

                const rows = await currentUnbanRows(guild).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })

                    return []
                })

                return await replyUnban.edit({
                    embeds: [await currentEmbedUnban(guild).catch(e => {
                        logger.error({
                            labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                            message: e instanceof Error ? e.message : JSON.stringify(e),
                        })
                        return {}
                    })
                    ],
                    components: rows.length ? [rows[0], rows[1], rows[2], rows[3], rows[4]] : [],
                }).catch(e => {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: e instanceof Error ? e.message : JSON.stringify(e),
                    })
                })
            }

            collectorStringSelect.on('collect', async (interaction) => {
                try {
                    if (interaction.customId === 'config_unban_other') {
                        const embedError = new EmbedBuilder()
                            .setDescription(`\`🔴\` Unban other is empty.`)
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
                            .setDescription(`\`🟡\` Unban other not found.`)
                            .setColor(Colours.YELLOW)

                        if (selected) {
                            await db.updatePunishments({ id: interaction?.guild?.id }, { unbanOther: JSON.parse(selected) })
                            await updateCurrentUnban()
                            await interaction.deferUpdate().catch(e => {
                                logger.error({
                                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                    message: e instanceof Error ? e.message : JSON.stringify(e),
                                })
                            })
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Unban other has been successfully set to \`${selected}\` by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured settings unban other to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                    } else if (interaction.customId === 'config_unban_leaker') {
                        const embedError = new EmbedBuilder()
                            .setDescription(`\`🔴\` Unban leaker is empty.`)
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
                            .setDescription(`\`🟡\` Unban leaker not found.`)
                            .setColor(Colours.YELLOW)

                        if (selected) {
                            await db.updatePunishments({ id: interaction?.guild?.id }, { unbanLeaker: JSON.parse(selected) })
                            await updateCurrentUnban()
                            await interaction.deferUpdate().catch(e => {
                                logger.error({
                                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                    message: e instanceof Error ? e.message : JSON.stringify(e),
                                })
                            })
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Unban leaker has been successfully set to \`${selected}\` by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured settings unban leaker to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                    } else if (interaction.customId === 'config_unban_cheater') {
                        const embedError = new EmbedBuilder()
                            .setDescription(`\`🔴\` Unban cheater is empty.`)
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
                            .setDescription(`\`🟡\` Unban cheater not found.`)
                            .setColor(Colours.YELLOW)

                        if (selected) {
                            await db.updatePunishments({ id: interaction?.guild?.id }, { unbanCheater: JSON.parse(selected) })
                            await updateCurrentUnban()
                            await interaction.deferUpdate().catch(e => {
                                logger.error({
                                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                    message: e instanceof Error ? e.message : JSON.stringify(e),
                                })
                            })
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Unban cheater has been successfully set to \`${selected}\` by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured settings unban cheater to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                    } else if (interaction.customId === 'config_unban_supporter') {
                        const embedError = new EmbedBuilder()
                            .setDescription(`\`🔴\` Unban supporter is empty.`)
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
                            .setDescription(`\`🟡\` Unban supporter not found.`)
                            .setColor(Colours.YELLOW)

                        if (selected) {
                            await db.updatePunishments({ id: interaction?.guild?.id }, { unbanSupporter: JSON.parse(selected) })
                            await updateCurrentUnban()
                            await interaction.deferUpdate().catch(e => {
                                logger.error({
                                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                    message: e instanceof Error ? e.message : JSON.stringify(e),
                                })
                            })
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Unban supporter has been successfully set to \`${selected}\` by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured settings unban supporter to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                    } else if (interaction.customId === 'config_unban_owner') {
                        const embedError = new EmbedBuilder()
                            .setDescription(`\`🔴\` Unban owner is empty.`)
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
                            .setDescription(`\`🟡\` Unban owner not found.`)
                            .setColor(Colours.YELLOW)

                        if (selected) {
                            await db.updatePunishments({ id: interaction?.guild?.id }, { unbanOwner: JSON.parse(selected) })
                            await updateCurrentUnban()
                            await interaction.deferUpdate().catch(e => {
                                logger.error({
                                    labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                    message: e instanceof Error ? e.message : JSON.stringify(e),
                                })
                            })
                            if (channel) sendEmbed({
                                channel,
                                embed: {
                                    description: `\`🟢\` Unban owner has been successfully set to \`${selected}\` by <@${interaction.user.id}>.`,
                                    color: Colours.GREEN,
                                },
                            })
                            logger.info({
                                labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                                message: `${interaction?.user?.tag} (${interaction?.user?.id}) configured settings unban owner to ${selected} for ${interaction?.guild?.name} (${interaction?.guild?.id})`,
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
                } catch (error) {
                    logger.error({
                        labels: { command: 'config', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
                        message: error instanceof Error ? error.message : JSON.stringify(error),
                    })
                }
            })
        }

        return
    }
})
