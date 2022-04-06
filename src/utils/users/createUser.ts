import { UserData } from '../../@types';
import { Bot } from '../../classes';

/**
 * Create a user
 *
 * @export
 * @param {Bot} client
 * @param {UserData} info
 */
export async function createUser({ client, info }: { client: Bot; info: UserData }) {
    return await client.db.users.create({
        data: info,
    });
}
