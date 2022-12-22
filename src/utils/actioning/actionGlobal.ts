import actionUser from './actionUser';
import db from '../database';
import { Client } from 'discord.js';

/**
 * Actions on all guilds
 * @param client Client
 */
export default async function (client: Client) {
    const guildIds = client.guilds.cache.map(x => x.id);
    const guilds = await db.getAllGuilds(
        { punishments: { enabled: true, globalCheck: true }, id: { in: guildIds } },
        { punishments: true, logChannel: true, id: true }
    );

    for (let i = 0; i < guilds.length; i++) {
        const element = guilds[i];
        if (!element.id) continue;

        const guild = client.guilds.cache.get(element.id);
        if (!guild) continue;

        await guild.members.fetch().then(async members => {
            const memberMap = members.filter(x => !x.user.bot).map(x => x.id);
            const users = await db.getManyUsers({
                id: { in: memberMap },
                status: { notIn: ['APPEALED', 'WHITELISTED'] },
            });

            if (users.length === 0) return;
            if (!element.punishments) return;
            if (!element.logChannel) return;

            for (let index = 0; index < users.length; index++) {
                const user = users[index];
                if (user.type === 'BOT') continue;

                actionUser(client, guild, element.logChannel, element.punishments, user);
            }
        });
    }
}
