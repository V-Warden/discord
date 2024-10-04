import { Client } from 'discord.js';
import logger from '../logger';

/**
 * Actions users globally, mainly used for forcecheck
 * @param client Client
 * @param ids Array of Discord user ids
 */
export default async function (c: Client, ids: string[]) {
    if (!c.shard)
        return logger.warn({
            labels: { userIds: ids.join(', ') },
            message: 'No shards online, unable to action appeal',
        });

    const result = await c.shard.broadcastEval(
        async (client, { userids }) => {
            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            const output: any[] = [];

            await client.guilds.fetch();

            for (let i = 0; i < client.guilds.cache.size; i++) {
                const guild = client.guilds.cache.at(i);
                if (!guild) continue;

                try {
                    const members = await guild.members.fetch();

                    for (const member of members.values()) {
                        if (userids.includes(member.id)) {
                            client.emit('guildMemberAdd', member);
                        }
                    }
                } catch (e) {
                    // Member not in guild
                    continue;
                }
                
                await delay(500);
            }

            return output;
        },
        { context: { userids: ids } }
    );

    for (let index = 0; index < result.length; index++) {
        for (let i = 0; i < result.length; i++) {
            logger.info(result[index][i]);
        }
    }

    return true;
}
