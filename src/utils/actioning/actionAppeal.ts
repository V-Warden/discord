import db from '../database';
import { Client } from 'discord.js';
import logger from '../logger';

/**
 * Removes roles/bans for user on appeal
 * @param client Client
 * @param id User ID
 */
export default async function (c: Client, id: string) {
    if (!c.shard)
        return console.log({
            labels: { command: 'appeal', userId: id },
            message: 'No shards online, unable to action appeal',
        });

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
            const guildBans = bans.filter(x => guilds.some(a => a === x.guild));
            const guildRoles = roles.filter(x => guilds.some(a => a === x.guild));

            if (!guildBans && !guildRoles) {
                output.push({
                    labels: { action: 'actionAppeal' },
                    message: `No bans or roles found for ${id} on this shard`,
                });

                return output;
            }

            if (guildBans.length > 0) {
                for (let index = 0; index < guildBans.length; index++) {
                    const element = bans[index];
                    try {
                        const guild = await client.guilds.fetch(element.guild);
                        const ban = await guild.bans.fetch({ user: element.id, force: true });

                        if (!ban.reason?.includes('Warden - User Type')) continue;

                        await guild.bans.remove(element.id);

                        output.push({
                            labels: { command: 'appeal', action: 'actionAppeal', guildId: guild.id },
                            message: `Unbaned ${element.id}`,
                        });
                    } catch (e) {
                        output.push({
                            labels: { command: 'appeal', action: 'actionAppeal' },
                            message: e,
                        });
                    }
                }
            } else {
                output.push({
                    labels: { command: 'appeal', action: 'actionAppeal' },
                    message: 'No bans found in database',
                });
            }

            if (guildRoles.length > 0) {
                for (let index = 0; index < guildRoles.length; index++) {
                    const element = roles[index];
                    try {
                        const guild = await client.guilds.fetch(element.guild);
                        const member = await guild.members.fetch(element.id);
                        await member.roles.set(element.roles.split(','));

                        output.push({
                            labels: { command: 'appeal', action: 'actionAppeal', guildId: guild.id },
                            message: `Set roles for ${member.id} - ${element.roles}`,
                        });
                    } catch (e) {
                        output.push({
                            labels: { command: 'appeal', action: 'actionAppeal' },
                            message: e,
                        });
                    }
                }
            } else {
                output.push({
                    labels: { command: 'appeal', action: 'actionAppeal' },
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

    await db.removeAllBans({ id });
    await db.removeAllRoles({ id });
    return;
}
