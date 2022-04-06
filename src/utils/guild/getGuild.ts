import { Snowflake } from 'discord.js';
import { Bot } from '../../classes';

export async function getGuild({ client, id }: { client: Bot; id: Snowflake }) {
    return await client.db.guild.findUnique({
        where: {
            id,
        },
    });
}
