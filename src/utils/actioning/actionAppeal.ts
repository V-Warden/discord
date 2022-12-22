import { ExtendedClient } from '../../structures/Client';
import logger from '../logger';

/**
 * Removes roles/bans for user on appeal
 * @param client Client
 * @param id User ID
 */
export default async function (client: ExtendedClient, id: string) {
    const guilds = (await client.guilds.fetch()).map(x => x.id);
    const bansPromise = client.prisma.getAllBans({
        id,
        Guild: { punishments: { unban: true } },
        guild: { in: guilds },
    });
    const rolesPromise = client.prisma.getAllRoles({ id, guild: { in: guilds } });

    const [bans, roles] = await Promise.all([bansPromise, rolesPromise]);

    if (!bans && !roles)
        return logger.info({
            labels: { action: 'actionAppeal' },
            message: `No bans or roles found for ${id}`,
        });

    if (bans.length > 0) {
        for (let index = 0; index < bans.length; index++) {
            const element = bans[index];
            try {
                const guild = await client.guilds.fetch(element.guild);
                const ban = await guild.bans.fetch({ user: element.id, force: true });

                if (!ban.reason?.includes('Warden - User Type')) continue;

                await guild.bans.remove(element.id);

                logger.info({
                    labels: { command: 'appeal', action: 'globalUnban', guildId: guild.id },
                    message: `Unbaned ${element.id}`,
                });
            } catch (e) {
                logger.error({
                    labels: { command: 'appeal', action: 'globalUnban' },
                    message: e,
                });
            }
        }
    }
    if (roles.length > 0) {
        for (let index = 0; index < roles.length; index++) {
            const element = roles[index];
            try {
                const guild = await client.guilds.fetch(element.guild);
                const member = await guild.members.fetch(element.id);
                await member.roles.set(element.roles.split(','));

                logger.info({
                    labels: { command: 'appeal', action: 'globalRole', guildId: guild.id },
                    message: `Set roles for ${member.id} - ${element.roles}`,
                });
            } catch (e) {
                logger.error({
                    labels: { command: 'appeal', action: 'globalRole' },
                    message: e,
                });
            }
        }
    }

    await client.prisma.removeAllBans({ id, guild: { in: guilds } });
    await client.prisma.removeAllRoles({ id, guild: { in: guilds } });

    return;
}
