import { Guild, Users, UserType } from '.prisma/client';
import { GuildMember, TextChannel } from 'discord.js';
import { Colours } from '../../@types';
import { noServerPerms } from '../../@types/Processing';
import { Bot } from '../../classes';
import { sendEmbed } from '../messages';

/**
 * Punishes user in a guild with
 * approiate actions where configured
 *
 * @param {Bot} client
 * @param {GuildMember} member
 * @param {Guild} guildInfo
 * @param {Users} oldUser
 * @param {boolean} toDM
 */
export async function punishUser({
    client,
    member,
    guildInfo,
    oldUser,
    toDM,
}: {
    client: Bot;
    member: GuildMember;
    guildInfo: Guild;
    oldUser: Users;
    toDM: boolean;
}) {
    if (member.user.bot) return false;

    const type = oldUser.user_type;
    const count = oldUser.servers.split(';').length;
    let toDo = '';

    if (!guildInfo)
        return client.logger.error(
            `CRITICAL: GUILD HAS NO SETTINGS ${member.guild.name} ${member.guild.id} - OWNER: ${member.guild.ownerId}`
        );
    const cachedChannel = client.logChans.get(guildInfo.id);
    let channel: TextChannel;
    if (cachedChannel && cachedChannel.id === guildInfo.logchan) {
        channel = cachedChannel;
    } else {
        try {
            channel = await client.getChannelByID(guildInfo.logchan, true, guildInfo.id);
        } catch (e) {
            channel = undefined;
        }
    }

    if (toDM) {
        await member
            .createDM()
            .then(chan => {
                chan.send({
                    content: `:shield: Warden
You are being automodded by ${guildInfo.name} for being associated with ${count} leaking or cheating discord servers.
You may attempt to appeal this via the Official Warden Discord:
https://discord.gg/jeFeDRasfs`,
                }).catch(e => {
                    client.logger.warn(
                        `punishUser ${guildInfo.name}: Unable to send DM to ${member.id} - ${e}`
                    );
                });
            })
            .catch(e => {
                client.logger.error(
                    `punishUser ${guildInfo.name}: Unable to create DM with ${member.id} - ${e}`
                );
                sendEmbed({
                    channel,
                    embed: {
                        description: `:warning: Unable to Direct Message User <@${member.id}>`,
                        author: {
                            name: `${member.user.username}#${member.user.discriminator} / ${member.id}`,
                            icon_url: member.user.defaultAvatarURL,
                        },
                        color: Colours.RED,
                    },
                }).catch();
            });
    }

    switch (type) {
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

    if (toDo === 'WARN') {
        if (!client.hasNoPerms(guildInfo.id, noServerPerms.SEND_MESSAGE)) {
            sendEmbed({
                channel,
                embed: {
                    description: `:warning: User ${oldUser.last_username} (${
                        member.id
                    }) has been seen in ${count} bad discord servers.\n**User Status**: ${oldUser.status.toLowerCase()} / **User Type**: ${type.toLowerCase()}.\n**Details**: ${
                        oldUser.reason
                    }`,
                    author: {
                        name: `${member.user.username}#${member.user.discriminator} / ${member.id}`,
                        icon_url: member.user.displayAvatarURL(),
                    },
                    color: Colours.GREEN,
                },
            }).catch(() => {
                client.addNoPerms(guildInfo.id, noServerPerms.SEND_MESSAGE);
                client.logger.warn(
                    `punishUser ${guildInfo.name}: Unable to send warning embed, no permissions?`
                );
            });
        }
        client.logger.info(
            `punishUser ${guildInfo.name}: ${oldUser.last_username} (${oldUser.id}) - ${toDo}`
        );
        return false;
    } else {
        const realType = toDo === 'BAN' ? noServerPerms.BAN : noServerPerms.KICK;
        if (!client.hasNoPerms(guildInfo.id, realType)) {
            const action =
                toDo === 'BAN'
                    ? member.ban({ reason: `Warden - User Type ${type}` })
                    : member.kick(`Warden - User Type ${type}`);
            await action
                .then(() => {
                    if (!client.hasNoPerms(guildInfo.id, noServerPerms.SEND_MESSAGE)) {
                        sendEmbed({
                            channel,
                            embed: {
                                description: `:shield: User ${oldUser.last_username} (${
                                    member.id
                                }) has been punished with a ${toDo}.\nThey have been seen in ${count} bad discord servers.\n**User Status**: ${oldUser.status.toLowerCase()} / **User Type**: ${type.toLowerCase()}.\n**Details**: ${
                                    oldUser.reason
                                }`,
                                author: {
                                    name: `${member.user.username}#${member.user.discriminator} / ${member.id}`,
                                    icon_url: member.displayAvatarURL(),
                                },
                                color: Colours.GREEN,
                            },
                        }).catch(() => {
                            client.addNoPerms(guildInfo.id, noServerPerms.SEND_MESSAGE);
                            client.logger.warn(
                                `punishUser ${guildInfo.name}: Unable to create message in ${channel?.id}`
                            );
                        });

                        client.logger.info(
                            `punishUser ${guildInfo.name}: ${oldUser.last_username} (${oldUser.id}) - ${toDo}`
                        );
                    }
                })
                .catch(e => {
                    client.addNoPerms(guildInfo.id, realType);
                    if (!client.hasNoPerms(guildInfo.id, noServerPerms.SEND_MESSAGE)) {
                        sendEmbed({
                            channel,
                            embed: {
                                description: `:warning: I tried to ${guildInfo.punown} ${oldUser.last_username} (${member.id}) but something errored!\nPlease verify I have this permission, and am a higher role than this user!`,
                                author: {
                                    name: `${member.user.username}#${member.user.discriminator} / ${member.id}`,
                                    icon_url: member.displayAvatarURL(),
                                },
                                color: Colours.RED,
                            },
                        }).catch(() =>
                            client.logger.warn(
                                `punishUser ${guildInfo.name}: Unable to create message in ${channel?.id}`
                            )
                        );
                    }

                    client.logger.warn(`punishUser ${guildInfo.name}: ${oldUser.id} - ${e}`);
                });
        }
        return false;
    }
}
