import db from '../database';
import { Client } from 'discord.js';
import logger from '../logger';

/**
 * Actions on all guilds
 * @param client Client
 */
export default async function (c: Client) {
    if (!c.shard)
        return logger.warn({
            labels: { command: 'globalscan' },
            message: 'No shards online, unable to perform globalscan',
        });

    const guilds = await db.getAllGuilds(
        { punishments: { enabled: true, globalCheck: true } },
        { punishments: true, logChannel: true, id: true }
    );

    const result = await c.shard.broadcastEval(
        async (client, { dbGuilds }) => {
            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            const output: any[] = [];

            await client.guilds.fetch();

            const guilds = client.guilds.cache.map(x => x.id);
            const guildSettings = dbGuilds.filter(x => guilds.some(a => a === x.id));

            for (let i = 0; i < client.guilds.cache.size; i++) {
                const guild = client.guilds.cache.at(i);
                if (!guild) continue;

                const settings = guildSettings.find(x => x.id === guild.id);
                if (!settings) continue;

                await guild.members.fetch();

                for (let a = 0; a < guild.members.cache.size; a++) {
                    const member = guild.members.cache.at(a);
                    if (!member) continue;

                    client.emit('guildMemberAdd', member);

                    output.push({
                        labels: { action: 'globalscan', guildId: guild.id },
                        message: `Emitted guildMemberAdd for ${member.id}`,
                    });

                    await delay(1000);
                }
            }

            return output;
        },
        { context: { dbGuilds: guilds } }
    );

    for (let index = 0; index < result.length; index++) {
        for (let i = 0; i < result.length; i++) {
            logger.info(result[index][i]);
        }
    }

    return true;
}
