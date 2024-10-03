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

            const guilds = await client.guilds.fetch();

            for (const guildData of guilds.values()) {
                try {
                    const guild = await client.guilds.fetch(guildData.id);
                    const members = await guild.members.fetch();

                    for (const member of members.values()) {
                        if (userids.includes(member.id)) {
                            client.emit('guildMemberAdd', member);
                            output.push({
                                labels: { action: 'globalscan', guildId: guild.id },
                                message: `Emitted guildMemberAdd for ${member.id}`,
                            });
                        }
                    }
                } catch (e) {
                    continue;
                }
                await delay(500);
            }

            return output;
        },
        { context: { userids: ids } }
    );

    for (const res of result) {
        for (const log of res) {
            logger.info(log);
        }
    }

    return true;
}
