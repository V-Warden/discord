import { Snowflake } from 'discord.js';
import { Bot } from '../../classes';

/**
 * Returns user data
 *
 * @export
 * @param {Bot} client
 * @param {id} Snowflake
 */
export async function getUser({ client, id }: { client: Bot; id: Snowflake }) {
    return await client.db.users.findUnique({
        where: {
            id,
        },
    });
}
