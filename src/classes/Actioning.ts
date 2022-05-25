import { Punish, Punishments, Users, UserType } from '@prisma/client';
import { GuildMember, TextChannel } from 'discord.js';
import { Colours, noServerPerms } from '../@types';
import { sendEmbed } from '../utils/messages';
import { Bot } from './Bot';

export class ActionUser {
    client: Bot;
    skipGuilds: string[];
    failed: { bans: number; kicks: number; warnings: number };
    success: { bans: number; kicks: number; warnings: number };

    constructor(client: Bot) {
        this.client = client;

        this.init();
    }

    async doAction(
        user: Users,
        logChannel: string,
        punishments: Punishments,
        member: GuildMember,
        toDM: boolean,
        process: boolean
    ) {
        if (member.user.bot) return;
        let toDo: Punish;
        switch (user.type) {
            case UserType.OWNER:
                toDo = punishments.owner;
                break;
            case UserType.SUPPORTER:
                toDo = punishments.supporter;
                break;
            case UserType.LEAKER:
                toDo = punishments.leaker;
                break;
            case UserType.CHEATER:
                toDo = punishments.cheater;
                break;
            case UserType.OTHER:
                toDo = punishments.other;
                break;
        }

        let channel: TextChannel;
        try {
            channel = await this.getCachedChannel(logChannel);
        } catch (e) {
            this.skipGuilds.push(punishments.id);
            return;
        }

        const count = await this.client.db.imports.count({ where: { id: user.id, appealed: false } });

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
You are being automodded by ${member.guild.name} for being associated with ${count} leaking, cheating or reselling discord servers.
You may attempt to appeal this via the Official Warden Discord:
https://discord.gg/jeFeDRasfs`,
                    }).catch(() =>
                        this.client.logger.warn(
                            `${this.constructor.name}: ${member.guild.name} - Unable to send message to ${member.id}`
                        )
                    );
                })
                .catch(() => {
                    sendEmbed({
                        channel,
                        embed: {
                            description: `\`:warning:\` Unable to Direct Message User <@${member.id}>`,
                            author,
                            color: Colours.RED,
                        },
                    }).catch();
                });
        }

        if (toDo === 'WARN') {
            // Stop warning messages on main discord
            if (punishments.id === '860760302227161118') return;
            if (!this.client.hasNoPerms(punishments.id, noServerPerms.SEND_MESSAGE)) {
                sendEmbed({
                    channel,
                    embed: {
                        description: `:warning: User ${user.last_username} (${
                            member.id
                        }) has been seen in ${count} bad discord servers.\n**User Status**: ${user.status.toLowerCase()} / **User Type**: ${user.type.toLowerCase()}`,
                        author,
                        color: Colours.GREEN,
                    },
                }).catch(() => {
                    this.client.addNoPerms(punishments.id, noServerPerms.SEND_MESSAGE);
                    this.client.logger.warn(
                        `${this.constructor.name}: ${member.guild.name} - Unable to send warning embed, no permissions?`
                    );
                });
            } else {
                if (process) this.failed.warnings += 1;
            }
            this.client.logger.debug(
                `${this.constructor.name}: ${member.guild.name} - ${user.last_username} (${user.id}) - ${toDo}`
            );
            if (process) this.success.warnings += 1;
        } else {
            const realType = toDo === 'BAN' ? noServerPerms.BAN : noServerPerms.KICK;
            if (!this.client.hasNoPerms(punishments.id, realType)) {
                let action;
                if (toDo === 'BAN') {
                    action = member.ban({ reason: `Warden - User Type ${user.type}` });
                    if (process) this.success.bans += 1;
                } else {
                    action = member.kick(`Warden - User Type ${user.type}`);
                    if (process) this.success.kicks += 1;
                }
                action
                    .then(() => {
                        if (!this.client.hasNoPerms(punishments.id, noServerPerms.SEND_MESSAGE)) {
                            sendEmbed({
                                channel,
                                embed: {
                                    description: `:shield: User ${user.last_username} (${
                                        member.id
                                    }) has been punished with a ${toDo}.\nThey have been seen in ${count} bad discord servers.\n**User Status**: ${user.status.toLowerCase()}`,
                                    author,
                                    color: Colours.GREEN,
                                },
                            }).catch(() => {
                                this.client.addNoPerms(punishments.id, noServerPerms.SEND_MESSAGE);
                                this.client.logger.warn(
                                    `${this.constructor.name}: ${member.guild.name} - Unable to create message in ${channel?.id}`
                                );
                            });
                        }

                        this.client.logger.debug(
                            `${this.constructor.name}: ${member.guild.name} - ${user.last_username} (${user.id}) - ${toDo}`
                        );
                    })
                    .catch(e => {
                        this.client.addNoPerms(punishments.id, realType);
                        if (toDo === 'BAN') {
                            if (process) this.failed.bans += 1;
                        } else {
                            if (process) this.failed.kicks += 1;
                        }

                        if (!this.client.hasNoPerms(punishments.id, noServerPerms.SEND_MESSAGE)) {
                            sendEmbed({
                                channel,
                                embed: {
                                    description: `:warning: I tried to ${toDo} ${user.last_username} (${member.id}) but something errored!\nPlease verify I have this permission, and am a higher role than this user!`,
                                    author,
                                    color: Colours.RED,
                                },
                            }).catch(() =>
                                this.client.logger.warn(
                                    `${this.constructor.name}: ${member.guild.name} - Unable to create message in ${channel?.id}`
                                )
                            );
                        }

                        this.client.logger.warn(
                            `${this.constructor.name}: ${member.guild.name} - ${user.id} - ${e} - ${realType}`
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

    getCachedChannel(logchan: string) {
        return (this.client.channels.cache.get(logchan) ||
            this.client.channels.fetch(logchan)) as TextChannel;
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
    }

    init() {
        this.reset();
        this.skipGuilds = [];
    }
}