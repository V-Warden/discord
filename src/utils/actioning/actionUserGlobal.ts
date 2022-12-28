import { Client } from 'discord.js';
import logger from '../logger';

/**
 * Actions a user globally, mainly used for forcecheck
 * @param client Client
 * @param id Discord user id
 */
export default async function (c: Client, id: string) {
    if (!c.shard)
        return logger.warn({
            labels: { userId: id },
            message: 'No shards online, unable to action appeal',
        });

    const result = await c.shard.broadcastEval(
        async (client, { userid }) => {
            const output: any[] = [];

            await client.guilds.fetch();

            for (let i = 0; i < client.guilds.cache.size; i++) {
                const guild = client.guilds.cache.at(i);
                if (!guild) continue;
                try {
                    const member = await guild.members.fetch(userid)
                    client.emit('guildMemberAdd', member)
                } catch (e) {
                    // Member not in guild
                    continue
                }
            }

            return output;
        },
        { context: { userid: id } }
    );

    for (let index = 0; index < result.length; index++) {
        for (let i = 0; i < result.length; i++) {
            logger.info(result[index][i]);
        }
    }

    return true;
}
