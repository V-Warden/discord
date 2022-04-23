import { Guild, Users, UserType } from '@prisma/client';
import { GuildMember, TextChannel } from 'discord.js';
import { Colours, noServerPerms } from '../@types';
import { sendEmbed } from '../utils/messages';
import { Bot } from './Bot';

export class PunishUser {
    bot: Bot;
    skipGuilds: string[];
    failed: { bans: number; kicks: number; warnings: number };
    success: { bans: number; kicks: number; warnings: number };

    constructor(bot: Bot) {
        this.success = {
            bans: 0,
            kicks: 0,
            warnings: 0,
        };
        this.failed = {
            bans: 0,
            kicks: 0,
            warnings: 0,
        };
        this.skipGuilds = [];

        this.bot = bot;
    }

    reset() {
        this.success = {
            bans: 0,
            kicks: 0,
            warnings: 0,
        };
        this.failed = {
            bans: 0,
            kicks: 0,
            warnings: 0,
        };

        this.skipGuilds = [];
    }

    async getCachedChannel(logchan: string) {
        return (this.bot.channels.cache.get(logchan) || this.bot.channels.fetch(logchan)) as TextChannel;
    }

    async actionUser(
        user: Users,
        guildInfo: Guild,
        member: GuildMember,
        toDM: boolean,
        process: boolean
    ) {
        if (member.user.bot) return;
        if (this.skipGuilds.includes(guildInfo.id)) return;

        let channel: TextChannel;
        try {
            channel = await this.getCachedChannel(guildInfo.logchan);
        } catch (e) {
            this.skipGuilds.push(guildInfo.id);
            return;
        }
        const count = user.servers.split(';').length;

        let toDo: string;
        switch (user.user_type) {
            case UserType.OWNER:
                toDo = guildInfo.punown;
                break;
            case UserType.SUPPORTER:
                toDo = guildInfo.punsupp;
                break;
            case UserType.LEAKER:
                toDo = guildInfo.punleak;
                break;
            case UserType.CHEATER:
                toDo = guildInfo.puncheat;
                break;
            case UserType.OTHER:
                toDo = guildInfo.punleak;
                break;
        }

        const author = {
            name: `${member.user.username}#${member.user.discriminator} / ${member.id}`,
            icon_url: member.displayAvatarURL(),
        };

        if (toDM) {
            await member
                .createDM()
                .then(chan => {
                    chan.send({
                        content: `:shield: Warden
    You are being automodded by ${guildInfo.name} for being associated with ${count} leaking, cheating or reselling discord servers.
    You may attempt to appeal this via the Official Warden Discord:
    https://discord.gg/jeFeDRasfs`,
                    }).catch(e => {
                        this.bot.logger.warn(
                            `punishUser ${guildInfo.name}: Unable to send DM to ${member.id} - ${e}`
                        );
                    });
                })
                .catch(e => {
                    this.bot.logger.error(
                        `punishUser ${guildInfo.name}: Unable to create DM with ${member.id} - ${e}`
                    );
                    sendEmbed({
                        channel,
                        embed: {
                            description: `:warning: Unable to Direct Message User <@${member.id}>`,
                            author,
                            color: Colours.RED,
                        },
                    }).catch();
                });
        }

        if (toDo === 'WARN') {
            if (!this.bot.hasNoPerms(guildInfo.id, noServerPerms.SEND_MESSAGE)) {
                sendEmbed({
                    channel,
                    embed: {
                        description: `:warning: User ${user.last_username} (${
                            member.id
                        }) has been seen in ${count} bad discord servers.\n**User Status**: ${user.status.toLowerCase()} / **User Type**: ${user.user_type.toLowerCase()}.\n**Details**: ${
                            user.reason
                        }`,
                        author,
                        color: Colours.GREEN,
                    },
                }).catch(() => {
                    this.bot.addNoPerms(guildInfo.id, noServerPerms.SEND_MESSAGE);
                    this.bot.logger.warn(
                        `punishUser ${guildInfo.name}: Unable to send warning embed, no permissions?`
                    );
                });
            } else {
                if (process) this.failed.warnings += 1;
            }
            this.bot.logger.info(
                `punishUser ${guildInfo.name}: ${user.last_username} (${user.id}) - ${toDo}`
            );
            if (process) this.success.warnings += 1;
        } else {
            const realType = toDo === 'BAN' ? noServerPerms.BAN : noServerPerms.KICK;
            if (!this.bot.hasNoPerms(guildInfo.id, realType)) {
                let action;
                if (toDo === 'BAN') {
                    action = member.ban({ reason: `Warden - User Type ${user.user_type}` });
                    if (process) this.success.bans += 1;
                } else {
                    action = member.kick(`Warden - User Type ${user.user_type}`);
                    if (process) this.success.kicks += 1;
                }
                action
                    .then(() => {
                        if (!this.bot.hasNoPerms(guildInfo.id, noServerPerms.SEND_MESSAGE)) {
                            sendEmbed({
                                channel,
                                embed: {
                                    description: `:shield: User ${user.last_username} (${
                                        member.id
                                    }) has been punished with a ${toDo}.\nThey have been seen in ${count} bad discord servers.\n**User Status**: ${user.status.toLowerCase()} / **User Type**: ${user.user_type.toLowerCase()}.\n**Details**: ${
                                        user.reason
                                    }`,
                                    author,
                                    color: Colours.GREEN,
                                },
                            }).catch(() => {
                                this.bot.addNoPerms(guildInfo.id, noServerPerms.SEND_MESSAGE);
                                this.bot.logger.warn(
                                    `punishUser ${guildInfo.name}: Unable to create message in ${channel?.id}`
                                );
                            });

                            this.bot.logger.info(
                                `punishUser ${guildInfo.name}: ${user.last_username} (${user.id}) - ${toDo}`
                            );
                        }
                    })
                    .catch(e => {
                        this.bot.addNoPerms(guildInfo.id, realType);
                        if (toDo === 'BAN') {
                            if (process) this.failed.bans += 1;
                        } else {
                            if (process) this.failed.kicks += 1;
                        }

                        if (!this.bot.hasNoPerms(guildInfo.id, noServerPerms.SEND_MESSAGE)) {
                            sendEmbed({
                                channel,
                                embed: {
                                    description: `:warning: I tried to ${toDo} ${user.last_username} (${member.id}) but something errored!\nPlease verify I have this permission, and am a higher role than this user!`,
                                    author,
                                    color: Colours.RED,
                                },
                            }).catch(() =>
                                this.bot.logger.warn(
                                    `punishUser ${guildInfo.name}: Unable to create message in ${channel?.id}`
                                )
                            );
                        }

                        this.bot.logger.warn(
                            `punishUser ${guildInfo.name}: ${user.id} - ${e} - ${realType}`
                        );
                    });
            } else {
                if (toDo === 'BAN') {
                    if (process) this.failed.bans += 1;
                } else {
                    if (process) this.failed.kicks += 1;
                }
            }
        }
    }

    dmUser(member: GuildMember, count: number, guildInfo: Guild) {
        member
            .createDM()
            .then(chan => {
                chan.send({
                    content: `:shield: Warden
You are being automodded by ${guildInfo.name} for being associated with ${count} leaking, cheating or reselling discord servers.
You may attempt to appeal this via the Official Warden Discord:
https://discord.gg/jeFeDRasfs`,
                }).catch(e => {
                    this.bot.logger.warn(
                        `punishUser ${guildInfo.name}: Unable to send DM to ${member.id} - ${e}`
                    );
                });
            })
            .catch(e => {
                this.bot.logger.error(
                    `punishUser ${guildInfo.name}: Unable to create DM with ${member.id} - ${e}`
                );
            });
    }
}
