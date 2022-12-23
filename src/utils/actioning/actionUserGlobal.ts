import { Client } from 'discord.js';
import logger from '../logger';

/**
 * Actions a user globally, mainly used for forcecheck
 * @param client Client
 * @param id Discord user id
 */
export default async function (c: Client, id: string) {
    if (!c.shard)
        return console.log({
            labels: { command: 'appeal', userId: id },
            message: 'No shards online, unable to action appeal',
        });

    const result = await c.shard.broadcastEval(
        async (client, { userid }) => {
            const output: any[] = [];

            await client.guilds.fetch();

            const guilds = client.guilds.cache.map(x => x.id);

            for (let i = 0; i < client.guilds.cache.size; i++) {
                const guild = client.guilds.cache.at(i);
                if (!guild) continue;
                const member = await guild.members.fetch(userid)
                if (!member) continue;

                client.emit('guildMemberAdd', member)

                output.push({
                    labels: { action: 'forcecheck', guildId: guild.id },
                    message: `Emitted guildMemberAdd for ${member.id}`,
                });
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

}
