import { Punishments } from '@prisma/client';
import {
    BaseCommandInteraction,
    ButtonInteraction,
    Collection,
    Message,
    MessageActionRow,
    Snowflake,
} from 'discord.js';
import { Colours } from '../@types';
import { sendEmbed } from '../utils/messages';
import { Bot } from './Bot';

export class Config {
    bot: Bot;
    guildMessageIDs: Collection<Snowflake, Message>;

    constructor(bot: Bot) {
        this.bot = bot;
        this.guildMessageIDs = new Collection();
    }

    clearGuildMessageIDs() {
        this.guildMessageIDs.clear();
    }

    async sendConfigMenu(interaction: ButtonInteraction | BaseCommandInteraction, guildID: Snowflake) {
        const guild = await this.bot.db.guild.findUnique({
            where: { id: guildID },
            select: { id: true, logChannel: true, punishments: true },
        });

        if (!guild) {
            sendEmbed({
                channel: interaction.channel,
                embed: {
                    description:
                        'Invalid guild found, please reinvite the bot. If this does not fix the issue, please open a support ticket in the Official Warden Discord',
                    color: Colours.RED,
                },
            });
            return;
        }

        const fields = this.generateFields(guild.logChannel, guild.punishments);
        const buttons = this.generateButtons();
        if (this.guildMessageIDs.has(guildID)) {
            const message = this.guildMessageIDs.get(guildID);

            try {
                await message.channel.fetch(); // fix channel not in cache
            } catch {
                this.guildMessageIDs.delete(guildID);
                this.sendConfigMenu(interaction, guildID);
                return;
            }

            await message
                .edit({
                    embeds: [
                        {
                            ...message.embeds[0],
                            ...{ description: `${message.embeds[0].description ?? ''}` },
                            ...{
                                fields: fields,
                            },
                        },
                    ],
                })
                .catch(() => {
                    sendEmbed({
                        channel: interaction.channel,
                        embed: {
                            author: {
                                name: 'Welcome to Warden!',
                                iconURL: this.bot.user.defaultAvatarURL,
                            },
                            fields: fields,
                            description: 'To setup the bot you will need to use the buttons below.',
                            color: Colours.GREEN,
                        },
                        components: [buttons],
                    }).then(res => this.guildMessageIDs.set(guildID, res as Message));
                });
        } else {
            sendEmbed({
                channel: interaction.channel,
                embed: {
                    author: {
                        name: 'Welcome to Warden!',
                        iconURL: this.bot.user.defaultAvatarURL,
                    },
                    fields: fields,
                    description: 'To setup the bot you will need to use the buttons below.',
                    color: Colours.GREEN,
                },
                components: [buttons],
            }).then(res => this.guildMessageIDs.set(guildID, res as Message));
        }
    }

    generateFields(logchan: string, punishments: Punishments) {
        return [
            {
                name: 'Actioning',
                value: `Status: \`${
                    punishments.enabled ? 'Enabled' : 'Disabled'
                }\`\n> This determins if the bot will have functionality on this guild`,
            },
            {
                name: 'Log Channel',
                value: `Channel: <#${logchan}>\n> A text channel where all bot logs are sent to`,
            },
            {
                name: 'Unban',
                value: `Status: \`${
                    punishments.unban ? 'Enabled' : 'Disabled'
                }\`\n> This will automatically unban a user when appealed, if they are banned via Warden`,
            },
            {
                name: 'Global Check',
                value: `Status: \`${
                    punishments.globalCheck ? 'Enabled' : 'Disabled'
                }\`\n> You can opt in or out of global scanning, you will have to use scanusers if this is disabled`,
            },
            {
                name: 'Punishments',
                inline: false,
                value: `Other -> \`${punishments.other}\`\nLeaker -> \`${punishments.leaker}\`\nCheater -> \`${punishments.cheater}\`\nSupporter -> \`${punishments.supporter}\`\nOwner -> \`${punishments.owner}\``,
            },
        ];
    }

    generateButtons() {
        return new MessageActionRow().addComponents([
            {
                type: 'BUTTON',
                style: 'SECONDARY',
                customId: 'CONFIG_TOGGLE_ACTIONING',
                emoji: '🤖',
                label: 'Toggle Actioning',
            },
            {
                type: 'BUTTON',
                style: 'SECONDARY',
                customId: 'CONFIG_TOGGLE_GLOBAL',
                emoji: '📖',
                label: 'Toggle GlobalCheck',
            },
            {
                type: 'BUTTON',
                style: 'SECONDARY',
                customId: 'CONFIG_TOGGLE_UNBAN',
                emoji: '🧹',
                label: 'Toggle Unban',
            },
            {
                type: 'BUTTON',
                style: 'SECONDARY',
                customId: 'CONFIG_LOG_CHANNEL',
                emoji: '📜',
                label: 'Log Channel',
            },
            {
                type: 'BUTTON',
                style: 'SECONDARY',
                customId: 'PUNISHMENT_PANEL',
                emoji: '📕',
                label: 'Punishments',
            },
        ]);
    }
}
