import { UserStatus } from '@prisma/client';
import { Bot } from '../../classes';

/**
 * Returns all blacklisted and permblacklisted users
 *
 * @export
 * @param {Bot} client
 */
export async function countBlacklisted({ client }: { client: Bot }) {
    return await client.db.users.count({
        where: {
            status: {
                in: [UserStatus.BLACKLIST, UserStatus.PERM_BLACKLIST],
            },
        },
    });
}
