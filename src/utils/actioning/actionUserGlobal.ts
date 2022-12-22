import { Punish, Users, UserType } from '@prisma/client';
import { Client, GuildMember, TextChannel } from 'discord.js';
import { Colours } from '../../@types/Colours';
import logger, { logException } from '../logger';
import sendEmbed from '../messages/sendEmbed';
import db from '../database';
import actionAppeal from './actionAppeal';

/**
 * Actions a user globally, mainly used for forcecheck
 * @param client Client
 * @param user Database user
 */
export default async function (client: Client, userid: string) {
    const guildIds = client.guilds.cache.map(x => x.id);
    const user = await db.getUser(userid);
    if (!user) return;

    const discordUser = await client.users.fetch(userid)
    if (discordUser.bot) return;

    console.time('action');

    // Reduce database queries by grabbing
    // all guilds that have punishments enabled
    const guilds = await db.getAllGuilds(
        { punishments: { enabled: true }, id: {in: guildIds} },
        { punishments: true, logChannel: true }
    );

    const imports = await db.getImports(userid);

    if (imports.length === 0 && ['PERM_BLACKLISTED', 'BLACKLISTED'].includes(user.status)) {
        const result = await db.failSafeStatus(user);
        if (result) {
            logger.debug({
                labels: { action: 'actionUserGlobal', userId: user.id },
                message: 'User being appealed',
            });
            await actionAppeal(client, user.id)
            return;
        }
    }

    let realCount = 0;

    try {
        if (imports.length === 1) {
            const toParse = imports[0].roles;
            if (toParse.includes('"servers":')) {
                const parsed = JSON.parse(toParse);
                const servers: string[] = parsed['servers'].split(';');
                realCount = servers.length;
            } else {
                realCount = 1;
            }
        } else {
            realCount = imports.length;
        }
    } catch (e) {
        logger.error({
            labels: { action: 'actionUserGlobal', userId: userid },
            message: e,
        });
        return;
    }

    for (let i = 0; i < client.guilds.cache.size; i++) {
        const guild = client.guilds.cache.at(i);
        if (!guild) continue;
        if (guild?.id === '860760302227161118') continue;
        let member: GuildMember;

        try {
            member = await guild?.members.fetch(userid);
        } catch (e: any) {
            if (e.message !== 'Unknown Member') console.trace(e);
            continue;
        }

        if (!member) continue;

        const settings = guilds.find(g => g?.punishments?.id === guild.id);
        if (!settings) continue;
        if (!settings.punishments?.enabled) continue;

        let toDo: Punish = 'WARN';
        switch (user.type) {
            case UserType.OWNER:
                toDo = settings?.punishments.owner;
                break;
            case UserType.SUPPORTER:
                toDo = settings?.punishments.supporter;
                break;
            case UserType.LEAKER:
                toDo = settings?.punishments.leaker;
                break;
            case UserType.CHEATER:
                toDo = settings?.punishments.cheater;
                break;
            case UserType.OTHER:
                toDo = settings?.punishments.other;
                break;
        }

        let channel: TextChannel;
        try {
            channel = (await client.channels.fetch(settings?.logChannel ?? '')) as TextChannel;
        } catch {
            continue;
        }

        if (!channel) continue;

        console.log(member)
        const author = {
            name: `${member.user.username}#${member.user.discriminator} / ${member.id}`,
            icon_url: member.displayAvatarURL(),
        };

        try {
            const chan = await member.createDM();
            await chan.send({
                content: `:shield: Warden
                    You are being automodded by ${member.guild.name} for being associated with ${realCount} leaking, cheating or reselling discord servers.
                    You may attempt to appeal this via the Official Warden Discord:
                    https://discord.gg/jeFeDRasfs`,
            });
        } catch (e) {
            continue;
        }

        if (toDo === 'WARN') {
            sendEmbed({
                channel,
                embed: {
                    description: `:warning: User ${user.last_username} (${
                        member.id
                    }) has been seen in ${realCount} bad discord servers.\n**User Status**: ${user.status.toLowerCase()} / **User Type**: ${user.type.toLowerCase()}`,
                    author,
                    color: Colours.GREEN,
                },
            });
        } else if (toDo === 'ROLE') {
            try {
                if (!settings.punishments.roleId) throw new Error('No role configured');
                const oldRoles = member.roles.cache.map(x => x.id).join(',');
                const hasBlacklisedAlready = member.roles.cache.find(x => x.id === settings.punishments?.roleId)
                if (hasBlacklisedAlready) continue;

                await member.roles.set([settings.punishments.roleId]);
                await db.createArchiveRole({
                    id: member.id,
                    roles: oldRoles,
                    Guild: { connect: { id: settings.punishments.id } },
                });
            } catch (e: any) {
                const errorId = await logException(null, e);
                sendEmbed({
                    channel,
                    embed: {
                        description: `I tried to remove this users role and set them to \`${settings.punishments.roleId}\`, however I encountered an error.\n> Error ID: ${errorId}`,
                        author,
                        color: Colours.RED,
                    },
                });
                continue;
            }
        } else if (toDo === 'KICK' || toDo === 'BAN') {
            let action = null;
            if (toDo === 'BAN') {
                action = member.ban({ reason: `Warden - User Type ${user.type}` });
            } else if (toDo === 'KICK') {
                action = member.kick(`Warden - User Type ${user.type}`);
            }
            if (!action) continue;
            try {
                await action;
                if (toDo === 'BAN') await db.createBan({ id: user.id, Guild: { connect: { id: settings.punishments.id } } });
                logger.info({
                    labels: { action: 'actionUserGlobal', guildId: member.guild.id },
                    message: `${toDo}ED - ${user.last_username} (${user.id})`,
                });
                sendEmbed({
                    channel,
                    embed: {
                        description: `:shield: User ${user.last_username} (${
                            member.id
                        }) has been punished with a ${toDo}.\nThey have been seen in ${realCount} bad discord servers.\n**User Status**: ${user.status.toLowerCase()}`,
                        author,
                        color: Colours.GREEN,
                    },
                });
            } catch (e) {
                logger.error({
                    labels: { action: 'actionUserGlobal', guildId: member.guild.id },
                    message: e,
                });
                continue;
            }
        }
    }
    console.timeEnd('action');
}
