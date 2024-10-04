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
            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            const output: any[] = [];

            try {
                await client.guilds.fetch();
            } catch (error) {
                console.error('Error fetching guilds:', error);
                return output;
            }

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
                
                await delay(100);
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
