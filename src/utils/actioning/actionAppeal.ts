import db from '../database';
import { Client, Guild, GuildBan, GuildMember } from 'discord.js';
import logger from '../logger';
import { Bans, Roles } from '@prisma/client';

/**
 * Removes roles/bans for user on appeal
 * @param client Client
 * @param id User ID
 */
export default async function (c: Client, id: string): Promise<boolean> {
    if (!c.shard) {
        logger.warn({
            labels: { userId: id },
            message: 'No shards online, unable to action appeal',
        });
        return false;
    }

    const bansPromise = db.getAllBans({
        id,
        Guild: { punishments: { unban: true, enabled: true } },
    });

    const rolesPromise = db.getAllRoles({ id });

    const [bans, roles] = await Promise.all([bansPromise, rolesPromise]);

    const result = await c.shard.broadcastEval(
        async (client, { id, bans, roles }) => {
            const output = [];

            await client.guilds.fetch();

            const guilds = client.guilds.cache.map(x => x.id);
            const guildBans: Bans[] = bans.filter(x => guilds.some(a => a === x.guild));
            const guildRoles: Roles[] = roles.filter(x => guilds.some(a => a === x.guild));

            if (!guildBans && !guildRoles) {
                output.push({
                    labels: { action: 'actionAppeal', userId: id },
                    message: `No bans or roles found for ${id} on this shard`,
                });

                return output;
            }

            if (guildBans.length > 0) {
                for (let index = 0; index < guildBans.length; index++) {
                    const element = guildBans[index];
                    try {
                        const guild: Guild = await client.guilds.fetch(element.guild);
                        const ban: GuildBan = await guild.bans.fetch({ user: element.id, force: true });

                        if (!ban.reason?.includes('Warden - User Type')) continue;

                        await guild.bans.remove(element.id);

                        output.push({
                            labels: { action: 'actionAppeal', guildId: guild.id },
                            message: `Unbanned ${element.id}`,
                        });
                    } catch (e) {
                        output.push({
                            labels: { action: 'actionAppeal' },
                            message: e,
                        });
                    }
                }
            } else {
                output.push({
                    labels: { action: 'actionAppeal', userId: id },
                    message: 'No bans found in database',
                });
            }

            if (guildRoles.length > 0) {
                for (let index = 0; index < guildRoles.length; index++) {
                    const element = guildRoles[index];
                    try {
                        const guild: Guild = await client.guilds.fetch(element.guild);
                        const member: GuildMember = await guild.members.fetch(element.id);
                        await member.roles.set(element.roles.split(','));

                        output.push({
                            labels: { action: 'actionAppeal', guildId: guild.id },
                            message: `Set roles for ${member.id} - ${element.roles}`,
                        });
                    } catch (e) {
                        output.push({
                            labels: { action: 'actionAppeal' },
                            message: e,
                        });
                    }
                }
            } else {
                output.push({
                    labels: { action: 'actionAppeal', userId: id },
                    message: 'No roles found in database',
                });
            }

            return output;
        },
        { context: { id: id, bans: bans, roles: roles } }
    );

    for (let index = 0; index < result.length; index++) {
        for (let i = 0; i < result.length; i++) {
            logger.info(result[index][i]);
        }
    }

    const removeBansPromise = db.removeAllBans({ id });
    const removeRolesPromise = db.removeAllRoles({ id });

    await Promise.all([removeBansPromise, removeRolesPromise]);

    return true;
}
